/**
 * Data Migration Script: Update Product Categories to Steel Tube Industry Specific
 *
 * This script migrates existing leads from generic product categories
 * (Electronics, Clothing, etc.) to steel tube industry specific categories.
 *
 * Run this script after updating the frontend components to use new categories.
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Legacy categories that need to be migrated
const LEGACY_CATEGORIES = [
  'electronics',
  'clothing',
  'home-garden',
  'sports',
  'books',
  'automotive',
  'health-beauty',
  'toys-games',
];

// New steel tube categories
const STEEL_TUBE_CATEGORIES = {
  'square-tubes': 'Square Tubes',
  'rectangular-tubes': 'Rectangular Tubes',
  'round-tubes': 'Round Tubes',
  'oval-tubes': 'Oval Tubes',
  'custom-steel-products': 'Custom Steel Products',
};

// Category mapping for data migration
const CATEGORY_MAPPING = {
  electronics: 'custom-steel-products',
  clothing: 'custom-steel-products',
  'home-garden': 'custom-steel-products',
  sports: 'custom-steel-products',
  books: 'custom-steel-products',
  automotive: 'custom-steel-products',
  'health-beauty': 'custom-steel-products',
  'toys-games': 'custom-steel-products',
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/inventoryapp'
    );
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Define Lead schema (simplified version for migration)
const leadSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    product: String, // This is the field that needs migration
    productInterest: String, // Alternative field name used in some places
    leadSource: String,
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: 'leads' }
);

const Lead = mongoose.model('Lead', leadSchema);

// Migration functions
const analyzeCurrentData = async () => {
  console.log('\n📊 Analyzing current lead data...');

  try {
    const totalLeads = await Lead.countDocuments();
    console.log(`Total leads in database: ${totalLeads}`);

    // Check product field
    const productFieldStats = await Lead.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('\nProduct field distribution:');
    productFieldStats.forEach((stat) => {
      const isLegacy = LEGACY_CATEGORIES.includes(stat._id);
      const status = isLegacy
        ? '🔄 (needs migration)'
        : stat._id
          ? '✅ (current)'
          : '❓ (null/undefined)';
      console.log(
        `  ${stat._id || 'null/undefined'}: ${stat.count} leads ${status}`
      );
    });

    // Check productInterest field
    const productInterestStats = await Lead.aggregate([
      { $group: { _id: '$productInterest', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    console.log('\nProductInterest field distribution:');
    productInterestStats.forEach((stat) => {
      const isLegacy = LEGACY_CATEGORIES.includes(stat._id);
      const status = isLegacy
        ? '🔄 (needs migration)'
        : stat._id
          ? '✅ (current)'
          : '❓ (null/undefined)';
      console.log(
        `  ${stat._id || 'null/undefined'}: ${stat.count} leads ${status}`
      );
    });

    return { totalLeads, productFieldStats, productInterestStats };
  } catch (error) {
    console.error('❌ Error analyzing data:', error);
    throw error;
  }
};

const performMigration = async (dryRun = true) => {
  console.log(
    `\n${dryRun ? '🧪' : '🚀'} ${dryRun ? 'DRY RUN:' : 'EXECUTING:'} Product category migration...`
  );

  try {
    let updateCount = 0;

    // Migrate legacy categories in 'product' field
    for (const [oldCategory, newCategory] of Object.entries(CATEGORY_MAPPING)) {
      const query = { product: oldCategory };
      const leadsToUpdate = await Lead.find(query);

      if (leadsToUpdate.length > 0) {
        console.log(
          `\n${dryRun ? 'Would update' : 'Updating'} ${leadsToUpdate.length} leads: "${oldCategory}" → "${newCategory}"`
        );

        if (!dryRun) {
          const result = await Lead.updateMany(query, {
            $set: {
              product: newCategory,
              updatedAt: new Date(),
            },
          });
          console.log(`  ✅ Updated ${result.modifiedCount} documents`);
          updateCount += result.modifiedCount;
        } else {
          console.log(`  📝 Sample leads that would be updated:`);
          leadsToUpdate.slice(0, 3).forEach((lead) => {
            console.log(
              `    - ${lead.name} (${lead.phone}) - Product: "${lead.product}"`
            );
          });
          if (leadsToUpdate.length > 3) {
            console.log(`    ... and ${leadsToUpdate.length - 3} more`);
          }
        }
      }
    }

    // Migrate legacy categories in 'productInterest' field
    for (const [oldCategory, newCategory] of Object.entries(CATEGORY_MAPPING)) {
      const query = { productInterest: oldCategory };
      const leadsToUpdate = await Lead.find(query);

      if (leadsToUpdate.length > 0) {
        console.log(
          `\n${dryRun ? 'Would update' : 'Updating'} ${leadsToUpdate.length} leads: productInterest "${oldCategory}" → "${newCategory}"`
        );

        if (!dryRun) {
          const result = await Lead.updateMany(query, {
            $set: {
              productInterest: newCategory,
              updatedAt: new Date(),
            },
          });
          console.log(`  ✅ Updated ${result.modifiedCount} documents`);
          updateCount += result.modifiedCount;
        }
      }
    }

    if (!dryRun) {
      console.log(
        `\n✅ Migration completed! Total documents updated: ${updateCount}`
      );
    } else {
      console.log(`\n📋 Dry run completed. No changes made to database.`);
    }

    return updateCount;
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

const verifyMigration = async () => {
  console.log('\n🔍 Verifying migration results...');

  try {
    const remainingLegacy = await Lead.find({
      $or: [
        { product: { $in: LEGACY_CATEGORIES } },
        { productInterest: { $in: LEGACY_CATEGORIES } },
      ],
    });

    if (remainingLegacy.length === 0) {
      console.log(
        '✅ Migration verification successful! No legacy categories found.'
      );
    } else {
      console.log(
        `⚠️  Warning: ${remainingLegacy.length} leads still have legacy categories:`
      );
      remainingLegacy.forEach((lead) => {
        console.log(
          `  - ${lead.name}: product="${lead.product}", productInterest="${lead.productInterest}"`
        );
      });
    }

    // Show final distribution
    await analyzeCurrentData();
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    throw error;
  }
};

// Main migration function
const main = async () => {
  console.log('🔧 Steel Tube Product Category Migration Tool');
  console.log('============================================');

  const args = process.argv.slice(2);
  const action = args[0] || 'analyze';
  const dryRun = !args.includes('--execute');

  try {
    await connectDB();

    switch (action) {
      case 'analyze':
        await analyzeCurrentData();
        break;

      case 'migrate':
        await analyzeCurrentData();
        await performMigration(dryRun);
        if (!dryRun) {
          await verifyMigration();
        }
        break;

      case 'verify':
        await verifyMigration();
        break;

      default:
        console.log('\nUsage:');
        console.log(
          '  node migrate-product-categories.js analyze    # Analyze current data'
        );
        console.log(
          '  node migrate-product-categories.js migrate    # Dry run migration'
        );
        console.log(
          '  node migrate-product-categories.js migrate --execute  # Execute migration'
        );
        console.log(
          '  node migrate-product-categories.js verify     # Verify migration results'
        );
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
  }
};

// Export for testing or require usage
module.exports = {
  analyzeCurrentData,
  performMigration,
  verifyMigration,
  CATEGORY_MAPPING,
  LEGACY_CATEGORIES,
  STEEL_TUBE_CATEGORIES,
};

// Run if called directly
if (require.main === module) {
  main();
}
