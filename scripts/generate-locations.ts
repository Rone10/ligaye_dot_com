import 'dotenv/config';
import { db } from '../lib/db';
import { locations } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

interface LocationData {
  id: string;
  city: string | null;
  district: string | null;
  region: string;
}

interface Region {
  id: string;
  name: string;
  slug: string;
}

interface District {
  id: string;
  name: string;
  cities: Array<{
    id: string;
    name: string;
  }>;
}

interface RegionWithData {
  region: Region;
  districts: District[];
}

interface SearchIndexItem {
  id: string;
  city: string;
  district: string;
  region: string;
  searchText: string;
}

// Popular regions that should be preloaded
const POPULAR_REGIONS = [
  'Banjul',
  'Kanifing Municipality', 
  'West Coast Region'
];

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

async function generateLocationFiles() {
  console.log('🚀 Starting location file generation...');
  
  try {
    // Fetch all locations from database
    console.log('📊 Fetching locations from database...');
    const allLocations = await db()
      .select()
      .from(locations)
      .where(eq(locations.deleted, false));
    
    console.log(`📈 Found ${allLocations.length} locations`);

    // Create output directory
    const outputDir = path.join(process.cwd(), 'public/data/locations');
    await fs.mkdir(outputDir, { recursive: true });
    await fs.mkdir(path.join(outputDir, 'districts'), { recursive: true });

    // Group data by region
    const regionMap = new Map<string, LocationData[]>();
    allLocations.forEach(location => {
      if (!regionMap.has(location.region)) {
        regionMap.set(location.region, []);
      }
      regionMap.get(location.region)!.push(location);
    });

    console.log(`🗺️  Found ${regionMap.size} regions`);

    // Generate regions.json
    const regions: Region[] = Array.from(regionMap.keys()).map((regionName, index) => ({
      id: (index + 1).toString(),
      name: regionName,
      slug: createSlug(regionName)
    }));
    
    await fs.writeFile(
      path.join(outputDir, 'regions.json'),
      JSON.stringify(regions, null, 2)
    );
    console.log('✅ Generated regions.json');

    // Generate individual region files and collect popular regions
    const popularRegionsData: RegionWithData[] = [];
    const searchIndex: SearchIndexItem[] = [];

    for (const region of regions) {
      const regionLocations = regionMap.get(region.name) || [];
      
      // Group by district within region
      const districtMap = new Map<string, LocationData[]>();
      regionLocations.forEach(location => {
        const districtName = location.district || 'Unknown District';
        if (!districtMap.has(districtName)) {
          districtMap.set(districtName, []);
        }
        districtMap.get(districtName)!.push(location);
      });

      // Create district data structure
      const districts: District[] = Array.from(districtMap.entries()).map(([districtName, districtLocations], index) => ({
        id: `${region.id}-${index + 1}`,
        name: districtName,
        cities: districtLocations
          .filter(loc => loc.city) // Only include locations with city names
          .map((loc, cityIndex) => ({
            id: loc.id,
            name: loc.city!
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
      }));

      const regionWithData: RegionWithData = {
        region,
        districts
      };

      // Write individual region file
      await fs.writeFile(
        path.join(outputDir, 'districts', `${region.slug}.json`),
        JSON.stringify(regionWithData, null, 2)
      );

      // Add to popular regions if applicable
      if (POPULAR_REGIONS.includes(region.name)) {
        popularRegionsData.push(regionWithData);
      }

      // Build search index
      regionLocations.forEach(location => {
        if (location.city) {
          const searchText = [
            location.city,
            location.district,
            location.region
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          searchIndex.push({
            id: location.id,
            city: location.city,
            district: location.district || '',
            region: location.region,
            searchText
          });
        }
      });

      console.log(`✅ Generated ${region.slug}.json (${districts.length} districts)`);
    }

    // Generate popular-regions.json
    await fs.writeFile(
      path.join(outputDir, 'popular-regions.json'),
      JSON.stringify(popularRegionsData, null, 2)
    );
    console.log(`✅ Generated popular-regions.json (${popularRegionsData.length} regions)`);

    // Generate search-index.json
    searchIndex.sort((a, b) => a.city.localeCompare(b.city));
    await fs.writeFile(
      path.join(outputDir, 'search-index.json'),
      JSON.stringify(searchIndex, null, 2)
    );
    console.log(`✅ Generated search-index.json (${searchIndex.length} searchable items)`);

    // Generate stats
    const stats = {
      totalLocations: allLocations.length,
      totalRegions: regions.length,
      totalSearchableItems: searchIndex.length,
      popularRegions: POPULAR_REGIONS,
      generatedAt: new Date().toISOString(),
      filesSizes: {
        'regions.json': JSON.stringify(regions).length,
        'popular-regions.json': JSON.stringify(popularRegionsData).length,
        'search-index.json': JSON.stringify(searchIndex).length
      }
    };

    await fs.writeFile(
      path.join(outputDir, 'stats.json'),
      JSON.stringify(stats, null, 2)
    );

    console.log('\n🎉 Location file generation completed successfully!');
    console.log(`📊 Stats:`);
    console.log(`   • Total locations: ${stats.totalLocations}`);
    console.log(`   • Total regions: ${stats.totalRegions}`);
    console.log(`   • Searchable items: ${stats.totalSearchableItems}`);
    console.log(`   • Popular regions: ${stats.popularRegions.join(', ')}`);
    console.log(`   • Files generated in: public/data/locations/`);

  } catch (error) {
    console.error('❌ Error generating location files:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  generateLocationFiles()
    .then(() => {
      console.log('✨ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

export { generateLocationFiles }; 