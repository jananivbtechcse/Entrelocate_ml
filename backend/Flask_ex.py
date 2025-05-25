from flask import Flask, request, jsonify
from flask_cors import CORS
import math
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from collections import Counter
import aiohttp
import asyncio
import concurrent.futures
import statistics
from opencage.geocoder import OpenCageGeocode
import overpy
import time
import geopandas as gpd
import osmnx as ox
from shapely.geometry import Point
import requests
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from sklearn.preprocessing import StandardScaler
from shapely.ops import unary_union

app = Flask(_name_)
CORS(app)

async def get_latlong(address, api_key):
    async with aiohttp.ClientSession() as session:
        geocoder_url = f"https://api.opencagedata.com/geocode/v1/json?q={address}&key={api_key}"
        async with session.get(geocoder_url) as response:
            result = await response.json()
            if result and result['results']:
                location = result['results'][0]['geometry']
                return location['lat'], location['lng']
            else:
                return None, None

async def fetch_data(session, city, business):
    url = "https://api.foursquare.com/v3/places/search"
    params = {
        "query": business,
        "near": city,
        "limit": 50,
        "fields": "name,rating,location"
    }
    headers = {
        "Accept": "application/json",
        "Authorization": "fsq3IDf6eRjF8sv9+n5YL4QExpYhaw/NOzU7LxSQTfM/s6I="
    }

    async with session.get(url, params=params, headers=headers) as response:
        return await response.json()

async def fetch_and_process_data(city, business, api_key):
    async with aiohttp.ClientSession() as session:
        data = await fetch_data(session, city, business)

        if 'results' not in data:
            print(f"Error: 'results' key not found in response for {city} - {business}")
            return pd.DataFrame(), "Invalid API response"

        tasks = []
        for venue in data['results']:
            address = venue.get('location', {}).get('formatted_address', 'N/A')
            tasks.append(asyncio.create_task(get_latlong(address, api_key)))

        results = await asyncio.gather(*tasks)

        data_list = [
            {
                "Name": venue.get('name', 'N/A'),
                "Rating": venue.get('rating', 'N/A'),
                "Address": venue.get('location', {}).get('formatted_address', 'N/A'),
                "Latitude": lat if lat is not None else 'Not found',
                "Longitude": lon if lon is not None else 'Not found'
            }
            for venue, (lat, lon) in zip(data['results'], results)
        ]

        return pd.DataFrame(data_list), None

async def get_data_for_city(city, business, api_key):
    return await fetch_and_process_data(city, business, api_key)

import numpy as np
import pandas as pd

def is_outlier(df, lat_col='Latitude', lon_col='Longitude', threshold=3):
    """
    Detect outliers in latitude and longitude columns using Median Absolute Deviation (MAD).
    Returns a boolean Series where True indicates an outlier.
    
    Parameters:
    - df: pandas DataFrame containing the data.
    - lat_col: string, name of the latitude column.
    - lon_col: string, name of the longitude column.
    - threshold: float, number of MADs to consider a point as an outlier.
    """
    # Ensure latitude and longitude columns are numeric
    df[lat_col] = pd.to_numeric(df[lat_col], errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col], errors='coerce')
    

    # Calculate median and MAD for latitude
    median_lat = df[lat_col].median()
    mad_lat = (df[lat_col] - median_lat).abs().median()

    # Calculate median and MAD for longitude
    median_lon = df[lon_col].median()
    mad_lon = (df[lon_col] - median_lon).abs().median()

    # Avoid division by zero
    if mad_lat == 0:
        mad_lat = 1e-9
    if mad_lon == 0:
        mad_lon = 1e-9

    # Calculate the modified Z-score
    modified_z_score_lat = (df[lat_col] - median_lat).abs() / mad_lat
    modified_z_score_lon = (df[lon_col] - median_lon).abs() / mad_lon

    # Identify outliers
    outliers_lat = modified_z_score_lat > threshold
    outliers_lon = modified_z_score_lon > threshold

    # Combine outliers from both latitude and longitude
    outliers = outliers_lat | outliers_lon

    # Optionally, consider rows with NaN as outliers
    outliers |= df[lat_col].isna() | df[lon_col].isna()

    return outliers




def clean_coordinates(df, lat_col='Latitude', lon_col='Longitude'):
    """
    Clean the DataFrame by removing rows with invalid or outlier coordinates.
    
    Parameters:
    - df: pandas DataFrame containing the data.
    - lat_col: string, name of the latitude column.
    - lon_col: string, name of the longitude column.
    
    Returns:
    - df_cleaned: pandas DataFrame with outliers removed.
    """
    df = df.copy()
    
    # Step 1: Remove rows with missing Latitude or Longitude
    df = df.dropna(subset=[lat_col, lon_col]).copy()

    df[lat_col] = pd.to_numeric(df[lat_col],errors='coerce')
    df[lon_col] = pd.to_numeric(df[lon_col],errors='coerce')
    
    # Step 2: Remove rows with Latitude and Longitude outside valid ranges
    df = df[
        (df[lat_col].between(-90, 90)) &
        (df[lon_col].between(-180, 180))
    ].reset_index(drop=True)
    
    # Step 3: Detect outliers
    outliers = is_outlier(df, lat_col, lon_col)
    
    # Step 4: Remove outliers
    df_cleaned = df[~outliers].reset_index(drop=True)
    
    return df_cleaned



def perform_analysis(df):

    df = df.dropna(subset=['Latitude', 'Longitude'])
    df = clean_coordinates(df)
    
    print("After removing ")
    print(df)
    
    #valid_lat_min, valid_lat_max = 40.5, 40.9
    #valid_lon_min, valid_lon_max = -74.25, -73.70

    # Filter out invalid coordinates
    #df = df[(df['Latitude'] >= valid_lat_min) & (df['Latitude'] <= valid_lat_max) & 
    # (df['Longitude'] >= valid_lon_min) & (df['Longitude'] <= valid_lon_max)
    #].reset_index(drop=True)

    data_latlong = df[['Latitude', 'Longitude']].values

    if len(data_latlong) == 0:
        return "No data for clustering", []

    # Feature Scaling
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(data_latlong)

    # Calculate Silhouette Scores for different values of K
    sil_scores = []
    K = range(2, 20)  # Start from 2 because silhouette score is not defined for k=1

    for k in K:
        # Perform clustering
        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
        cluster_labels = kmeans.fit_predict(data_scaled)
        
        # Calculate Silhouette Score
        score = silhouette_score(data_scaled, cluster_labels)
        sil_scores.append(score)
        
        # Debugging: Print each score
        #print(f"K={k}, Silhouette Score={score}")

    # Find the optimal K
    optimal_k = K[np.argmax(sil_scores)]
    print("Optimal K:", optimal_k)
   

    # Perform KMeans clustering using the optimal K value
    kmeans = KMeans(n_clusters=optimal_k, n_init=5, random_state=42)
    kmeans.fit(data_latlong)

    # Store cluster assignments in the DataFrame
    df['cluster'] = kmeans.labels_

    df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
    df['Rating'].fillna(df['Rating'].median(), inplace=True)  # or use mean()


    average_ratings = df.groupby('cluster')['Rating'].mean()
    sorted_avg_ratings = average_ratings.sort_values()
    last_5_min_clusters = sorted_avg_ratings.head(max(math.ceil(optimal_k/1.5), 2))
    print("the first cluster",last_5_min_clusters)
    cluster_counts = Counter(df['cluster'])
    last_5_min_cluster_counts = {cluster: cluster_counts[cluster] for cluster in last_5_min_clusters.index}
    pop_d = max(math.ceil(optimal_k/3),2)
    print("the second min clusters",pop_d)
    top_3_min_clusters = dict(sorted(last_5_min_cluster_counts.items(), key=lambda item: item[1])[:pop_d])


    top_3_cluster_data = [
        {'cluster': cluster, 'population': len(df[df['cluster'] == cluster]) * 100}
        for cluster in top_3_min_clusters.keys()
    ]

    top_3_cluster_df = pd.DataFrame(top_3_cluster_data)
    cluster_bounding_boxes_sorted = top_3_cluster_df.sort_values(by='population', ascending=False).reset_index(drop=True)
    cluster_bounding_boxes_sorted['score'] = [(i/pop_d)*100 for i in range(pop_d, 0, -1)]

    # recommended_cluster = f"Cluster {int(cluster_bounding_boxes_sorted['cluster'].iloc[0])}"
    # cluster_points = df[df['cluster'] == cluster_bounding_boxes_sorted['cluster'].iloc[0]]
    # neighborhood_areas = cluster_points['Address'].unique().tolist()[:5]

    # return recommended_cluster, neighborhood_areas
    recommended_clusters = []
    for i, row in cluster_bounding_boxes_sorted.iterrows():
        cluster_id = int(row['cluster'])
        cluster_points = df[df['cluster'] == cluster_id]
        neighborhood_areas = cluster_points['Address'].unique().tolist()[:5]
        
        recommended_clusters.append({
            'cluster': f"Cluster {cluster_id}",
            'population': row['population'],
            'neighborhood_areas': neighborhood_areas
        })
    
    return recommended_clusters


async def get_city_bounding_box_async(city_name, api_key):
    geocoder = OpenCageGeocode(api_key)
    result = await asyncio.to_thread(geocoder.geocode, city_name)
    
    if result:
        bounds = result[0]['bounds']
        min_lat = bounds['southwest']['lat']
        min_lon = bounds['southwest']['lng']
        max_lat = bounds['northeast']['lat']
        max_lon = bounds['northeast']['lng']
        print(min_lat, min_lon, max_lat, max_lon)
        return min_lat, min_lon, max_lat, max_lon
    else:
        return None, None, None, None
def make_json_serializable(data):
    # Recursively convert np.int32 to int
    if isinstance(data, dict):
        return {key: make_json_serializable(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [make_json_serializable(item) for item in data]
    elif isinstance(data, np.int32):
        return int(data)
    else:
        return data


# async def get_shops_in_bounding_box(min_lat, min_lon, max_lat, max_lon, limit=200):
#     overpass_url = "http://overpass-api.de/api/interpreter"
    
#     overpass_query = f"""
#     [out:json][timeout:25];
#     (
#       node["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
#       way["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
#       relation["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
#     );
#     out center;
#     """
    
#     async with aiohttp.ClientSession() as session:
#         async with session.get(overpass_url, params={'data': overpass_query}) as response:
#             if response.status != 200:
#                 print(f"Failed to retrieve data. Status code: {response.status}")
#                 return []
            
#             data = await response.json()
            
#             if 'elements' not in data:
#                 print("No data found.")
#                 return []
            
#             shops = data['elements']
#             print(f"Found {len(shops)} shops. Processing up to {limit} shops...")
            
#             shop_data = []
#             for shop in shops[:limit]:
#                 if 'tags' in shop:
#                     if 'center' in shop:
#                         lat = shop['center']['lat']
#                         lon = shop['center']['lon']
#                     else:
#                         lat = shop.get('lat')
#                         lon = shop.get('lon')

#                     if lat is not None and lon is not None:
#                         shop_data.append({
#                             'name': shop['tags'].get('name', 'Unnamed shop'),
#                             'type': shop['tags'].get('shop', 'Unspecified'),
#                             'lat': lat,
#                             'lon': lon
#                         })

#             return shop_data

async def get_shops_in_bounding_box(min_lat, min_lon, max_lat, max_lon, limit=200):
    """
    Fetch shops within a bounding box using the Overpass API.

    Args:
        min_lat (float): Minimum latitude of the bounding box.
        min_lon (float): Minimum longitude of the bounding box.
        max_lat (float): Maximum latitude of the bounding box.
        max_lon (float): Maximum longitude of the bounding box.
        limit (int): Maximum number of shops to retrieve.

    Returns:
        list: A list of shops with their name, type, latitude, and longitude.
    """
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = f"""
    [out:json][timeout:25];
    (
      node["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
      way["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
      relation["shop"]({min_lat},{min_lon},{max_lat},{max_lon});
    );
    out center;
    """

    headers = {
        "Accept-Encoding": "gzip, deflate",
        "User-Agent": "MyApp/1.0"
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(overpass_url, params={'data': overpass_query}, headers=headers) as response:
                if response.status != 200:
                    print(f"Failed to retrieve data. Status code: {response.status}")
                    return []
                
                # Check if the response is compressed
                if response.headers.get('Content-Encoding') == 'gzip':
                    print("Response is gzip-encoded. Decoding...")
                
                # Parse the JSON response
                data = await response.json()

                if 'elements' not in data:
                    print("No data found in the response.")
                    return []

                shops = data['elements']
                print(f"Found {len(shops)} shops. Processing up to {limit} shops...")

                # Extract shop data
                shop_data = []
                for shop in shops[:limit]:
                    if 'tags' in shop:
                        if 'center' in shop:
                            lat = shop['center']['lat']
                            lon = shop['center']['lon']
                        else:
                            lat = shop.get('lat')
                            lon = shop.get('lon')

                        if lat is not None and lon is not None:
                            shop_data.append({
                                'name': shop['tags'].get('name', 'Unnamed shop'),
                                'type': shop['tags'].get('shop', 'Unspecified'),
                                'lat': lat,
                                'lon': lon
                            })

                return shop_data

    except aiohttp.ClientError as e:
        print(f"Network error: {e}")
        return []
    except asyncio.TimeoutError:
        print("Request timed out.")
        return []
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return []


category_mapping = {
    "supermarket": "Retail",
    "convenience": "Retail",
    "grocery": "Retail",
    "greengrocer": "Retail",
    "department_store": "Retail",
    "bakery": "Food & Beverage",
    "butcher": "Food & Beverage",
    "beverages": "Food & Beverage",
    "seafood": "Food & Beverage",
    "dairy": "Food & Beverage",
    "pharmacy": "Health",
    "chemist": "Health",
    "optician": "Health",
    "hairdresser": "Apparel",
    "jewellery": "Apparel",
    "clothes": "Apparel",
    "shoe": "Apparel",
    "fashion_accessories": "Apparel",
    "electronics": "Electronics",
    "mobile_phone": "Electronics",
    "car_repair": "Automotive",
    "bicycle": "Automotive",
    "car": "Automotive",
    "hardware": "Hardware",
    "paint": "House needs",
    "dry_cleaning": "House needs",
    "houseware": "House needs",
    "furniture": "House needs",
    "stationary": "House needs"
}
# Default category for unmapped shops
default_category = "Other"

def generalize_shop_category(shop_type):
    """Generalize the shop type into a broader category."""
    return category_mapping.get(shop_type, default_category)

# Example usage with your existing shop data
def apply_generalization(shop_data):
    for shop in shop_data:
        specific_category = shop.get('type')
        broad_category = generalize_shop_category(specific_category)
        shop['generalized_category'] = broad_category
    return shop_data
def filter_out_other(shop_data):
    """Filter out shops with 'Other' category."""
    return [shop for shop in shop_data if shop['generalized_category'] != 'Other']
def count_shops_by_category(shop_data):
    """Count the number of shops in each generalized category."""
    categories = [shop['generalized_category'] for shop in shop_data]
    return Counter(categories)
def calculate_optimal_k(coordinates, max_k=10):
    # wcss = []
    # for k in range(1, max_k + 1):
    #     kmeans = KMeans(n_clusters=k)
    #     kmeans.fit(coordinates)
    #     wcss.append(kmeans.inertia_)
    # # Find the "elbow" point, where the WCSS begins to flatten out
    # optimal_k = np.argmax(np.diff(wcss)) + 2  # Adding 2 because np.diff reduces length by 1
    # print(f"Optimal K determined by Elbow Method: {optimal_k}")
    def kmeans_inertia(k):
        kmeans = KMeans(n_clusters=k)
        kmeans.fit(coordinates)
        return kmeans.inertia_
    
    with ThreadPoolExecutor() as executor:
        wcss = list(executor.map(kmeans_inertia, range(1, max_k + 1)))

    optimal_k = np.argmax(np.diff(wcss)) + 2
    print(f"Optimal K determined by Elbow Method: {optimal_k}")
    return optimal_k

def calculate_bounding_box(df):
    south = df['lat'].min()
    north = df['lat'].max()
    west = df['lon'].min()
    east = df['lon'].max()
    return south, north, west, east

def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = np.sin(dlat/2)*2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)*2
    c = 2 * np.arctan2(np.sqrt(a), np.sqrt(1-a))
    
    distance = R * c
    return distance

def estimate_population(south, west, north, east):
    # Calculate the area of the bounding box in square kilometers
    width = haversine_distance(south, west, south, east)
    height = haversine_distance(south, west, north, west)
    area = width * height
    
    # Estimate population based on area and average population density
    # Using a rough estimate of 10,000 people per square km for urban areas
    estimated_population = int(area * 16)
    
    return estimated_population

# Function to get the best available name for each neighborhood
def get_area_name(row):
    for col in ['name', 'name:en', 'addr:city', 'place_name']:
        if col in row and pd.notna(row[col]):
            return row[col]
    return f"Area_{row.name}"  # Use the index as a fallback

def find_neighborhoods_for_cluster(df, cluster_number, neighborhoods, max_neighborhoods=4):
    """Find neighborhoods for a cluster with limit on number of results"""
    # Filter the DataFrame for the specified cluster
    cluster_points = df[df['cluster'] == cluster_number]
    
    if cluster_points.empty:
        print(f"No points found for cluster {cluster_number}.")
        return []

    # Create a GeoDataFrame with WGS 84 coordinates
    gdf = gpd.GeoDataFrame(
        cluster_points,
        geometry=[Point(xy) for xy in zip(cluster_points.lon, cluster_points.lat)],
        crs="EPSG:4326"
    )
    
    # Convert to the same projected CRS as neighborhoods
    gdf = gdf.to_crs(neighborhoods.crs)
    
    # Create a buffer around points in meters
    gdf['geometry'] = gdf.geometry.buffer(100)  # 100m buffer
    
    # Create a single polygon that encompasses all points in the cluster
    cluster_boundary = unary_union(gdf.geometry)
    
    try:
        # Find intersecting neighborhoods
        intersecting = neighborhoods[neighborhoods.geometry.intersects(cluster_boundary)]
        
        if not intersecting.empty:
            # Get the most relevant neighborhoods (limited to max_neighborhoods)
            # Sort by intersection area to get the most relevant ones
            intersecting['intersection_area'] = intersecting.geometry.intersection(cluster_boundary).area
            intersecting = intersecting.sort_values('intersection_area', ascending=False)
            
            # Take only the top neighborhoods
            unique_neighborhoods = intersecting['area_name'].head(max_neighborhoods).unique()
            print(f"Found neighborhoods for cluster {cluster_number}: {unique_neighborhoods}")
            return list(unique_neighborhoods)
        else:
            print(f"No intersecting neighborhoods found for cluster {cluster_number}")
            return []
            
    except Exception as e:
        print(f"Error in spatial analysis: {str(e)}")
        return []


def prepare_neighborhoods(city):
    """Prepare neighborhood data with proper formatting and CRS"""
    try:
        # Get neighborhood geometries with both points and polygons
        tags = {
            'boundary': ['administrative'],
            'admin_level': ['10'],  # neighborhood level
            'place': ['neighbourhood', 'suburb']
        }
        
        # Get both polygon and point geometries
        neighborhoods = ox.geometries_from_place(city, tags=tags)
        
        # Convert to GeoDataFrame with projected CRS for accurate spatial operations
        neighborhoods = gpd.GeoDataFrame(neighborhoods, crs="EPSG:4326")
        
        # Convert to a projected CRS (UTM zone for New York)
        neighborhoods = neighborhoods.to_crs("EPSG:32618")  # UTM zone 18N for New York
        
        # For point geometries, create circular buffers to approximate neighborhood areas
        point_mask = neighborhoods.geometry.type == 'Point'
        if point_mask.any():
            neighborhoods.loc[point_mask, 'geometry'] = neighborhoods[point_mask].geometry.buffer(500)  # 500m buffer
        
        # Add area_name with multiple fallback options
        def get_area_name(row):
            for col in ['name', 'name:en', 'addr:city', 'place_name']:
                if col in row.index and pd.notna(row[col]):
                    return row[col]
            return None
        
        neighborhoods['area_name'] = neighborhoods.apply(get_area_name, axis=1)
        
        # Remove any rows without names or geometries
        neighborhoods = neighborhoods.dropna(subset=['area_name', 'geometry'])
        
        # Debug information
        print("\nNeighborhood preparation debug info:")
        print(f"Total neighborhoods: {len(neighborhoods)}")
        print(f"Neighborhoods with names: {neighborhoods['area_name'].notna().sum()}")
        print("Geometry types:")
        print(neighborhoods.geometry.type.value_counts())
        
        return neighborhoods
        
    except Exception as e:
        print(f"Error preparing neighborhoods: {str(e)}")
        return gpd.GeoDataFrame()

def perform_analysis_business(new_york_df, k_optimal, category_to_clusters, neighborhoods):
    cluster_bounding_boxes = new_york_df.groupby('cluster').apply(
        lambda x: pd.Series(calculate_bounding_box(x), index=['south', 'west', 'north', 'east'])
    ).reset_index()

    print("Cluster Bounding Boxes:")
    print(cluster_bounding_boxes)

    # Calculate population for each cluster
    populations = []
    for _, row in cluster_bounding_boxes.iterrows():
        pop = estimate_population(row['south'], row['west'], row['north'], row['east'])
        populations.append(pop)

    cluster_bounding_boxes['population'] = populations

    # Sort by population
    cluster_bounding_boxes_sorted = cluster_bounding_boxes.sort_values(by='population', ascending=False).reset_index(drop=True)

    # Assign scores
    cluster_bounding_boxes_sorted['score'] = [i * 10 for i in range(k_optimal, 0, -1)]

    # Create score dictionary
    score_dict = cluster_bounding_boxes_sorted.set_index('cluster')['score'].to_dict()

    print("\nScore Dictionary:")
    print(score_dict)

    sorted_score_dict = dict(sorted(score_dict.items()))

    # Count clusters for each category
    category_counts = {category: len(clusters) for category, clusters in category_to_clusters.items()}
    sorted_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)
    top_5_categories = [category for category, _ in sorted_categories[:5]]

    result = []
    for category in top_5_categories:
        clusters = category_to_clusters[category]
        max_score_cluster = max(clusters, key=lambda cluster: sorted_score_dict[cluster])
        max_score = sorted_score_dict[max_score_cluster]
        # Pass max_neighborhoods=4 to limit the results
        neighborhood_areas = find_neighborhoods_for_cluster(
            new_york_df, 
            max_score_cluster, 
            neighborhoods,
            max_neighborhoods=4  # Limit to 4 neighborhoods
        )

        result.append({
            'category': category,
            'max_score_cluster': max_score_cluster,
            'max_score': max_score,
            'neighborhood': neighborhood_areas
        })

    return result

@app.route('/api/location', methods=['POST'])
async def analyze_location():
    print("Analyzing location...")

    data = request.json
    city = data.get('city')
    business = data.get('business')

    if not city or not business:
        return jsonify({"error": "Missing city or business information"}), 400

    try:
        df, error = await get_data_for_city(city, business, '3fe40ec792dc41e180275f912fee083f')
        print(f"Returned data: df={df}, error={error}")
    except Exception as e:
        print(f"Error fetching data: {e}")
        return jsonify({"error": str(e)}), 500

    if df.empty:
        print("No data found for the given city or business")
        return jsonify({"error": "No data found for the given city or business"}), 404

    loop = asyncio.get_event_loop()
    recommended_clusters = await loop.run_in_executor(None, perform_analysis, df)
    print(recommended_clusters)
    for cluster_info in recommended_clusters:
        recommended_cluster = cluster_info['cluster']
        neighborhoods = ", ".join(cluster_info['neighborhood_areas'])  # Join the neighborhoods into a comma-separated string
        print(f"Recommended cluster: {recommended_cluster}, Neighborhoods: {neighborhoods}")

    results = {
        "recommended_clusters": recommended_clusters  # This will be the list of clusters and neighborhoods
    }
    
    # Returning the result as JSON
    return jsonify(results)
    


import warnings
@app.route('/api/business', methods=['POST'])

async def analyze_business():
    print("Analyzing business...")

    data = request.json
    city = data.get('city')

    if not city:
        return jsonify({"error": "Missing city"}), 400

    api_key = '3fe40ec792dc41e180275f912fee083f'
    min_lat, min_lon, max_lat, max_lon = await get_city_bounding_box_async(city, api_key)
    shop_data = await get_shops_in_bounding_box(min_lat, min_lon, max_lat, max_lon, limit=500)
    if not shop_data:
        print("No shops found in the bounding box")
    generalized_shop_data = apply_generalization(shop_data)

    warnings.filterwarnings('ignore')
    neighborhoods = prepare_neighborhoods(city)

    filtered_shop_data = filter_out_other(generalized_shop_data)
    category_counts = count_shops_by_category(filtered_shop_data)

    print("Number of shops in each category:")
    for category, count in category_counts.items():
        print(f"{category}: {count}")

    coordinates = [(shop['lat'], shop['lon']) for shop in filtered_shop_data]
    k_optimal = calculate_optimal_k(coordinates, max_k=10)
    kmeans = KMeans(n_clusters=k_optimal)
    cluster_labels = kmeans.fit_predict(coordinates)

    # Add cluster labels to the shop data
    for i, shop in enumerate(filtered_shop_data):
        shop['cluster'] = cluster_labels[i]

    cluster_category_counts = defaultdict(lambda: defaultdict(int))
    for shop in filtered_shop_data:
        cluster_label = shop['cluster']
        category = shop['generalized_category']
        cluster_category_counts[cluster_label][category] += 1

    all_categories = set(category_mapping.values())
    cluster_zero_counts = defaultdict(set)
    for cluster_label in cluster_category_counts:
        present_categories = set(cluster_category_counts[cluster_label].keys())
        missing_categories = all_categories - present_categories
        if missing_categories:
            cluster_zero_counts[cluster_label].update(missing_categories)

    category_to_clusters = defaultdict(set)
    for cluster, categories in cluster_zero_counts.items():
        for category in categories:
            category_to_clusters[category].add(cluster)

    new_york_df = pd.DataFrame(filtered_shop_data, columns=['name', 'type', 'lat', 'lon', 'cluster', 'generalized_category'])

    result = perform_analysis_business(new_york_df, k_optimal, category_to_clusters, neighborhoods)
    serializable_results = make_json_serializable(result)

    return jsonify(serializable_results)


if _name_ == "_main_":
    app.run(debug=True)