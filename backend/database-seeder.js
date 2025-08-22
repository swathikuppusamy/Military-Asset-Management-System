const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const User = require('./models/User');
const Base = require('./models/Base');
const AssetType = require('./models/AssetType');
const Asset = require('./models/Asset');
const Purchase = require('./models/Purchase');
const Transfer = require('./models/Transfer');
const Assignment = require('./models/Assignment');
const Expenditure = require('./models/Expenditure');

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/military-assets');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create sample bases
const createSampleBases = async () => {
  const bases = [
    {
      code: 'FL001',
      name: 'Fort Liberty',
      location: 'North Carolina, USA'
    },
    {
      code: 'NB002',
      name: 'Naval Base Norfolk',
      location: 'Virginia, USA'
    },
    {
      code: 'RAB003',
      name: 'Ramstein Air Base',
      location: 'Germany'
    }
  ];

  try {
    await Base.deleteMany({});
    const createdBases = await Base.create(bases);
    console.log('Sample bases created:', createdBases.length);
    return createdBases;
  } catch (error) {
    console.error('Error creating sample bases:', error);
    return [];
  }
};

// Create sample asset types
const createSampleAssetTypes = async () => {
  const assetTypes = [
    {
      name: 'M4 Carbine',
      category: 'weapon',
      description: 'Standard issue assault rifle',
      isConsumable: false,
      unit: 'piece'
    },
    {
      name: '5.56mm Ammunition',
      category: 'ammunition',
      description: 'Standard rifle ammunition',
      isConsumable: true,
      unit: 'rounds'
    },
    {
      name: 'Humvee',
      category: 'vehicle',
      description: 'High Mobility Multipurpose Wheeled Vehicle',
      isConsumable: false,
      unit: 'piece'
    },
    {
      name: 'Night Vision Goggles',
      category: 'equipment',
      description: 'AN/PVS-14 Night Vision Monocular',
      isConsumable: false,
      unit: 'piece'
    },
    {
      name: 'MRE',
      category: 'other',
      description: 'Meal Ready to Eat',
      isConsumable: true,
      unit: 'piece'
    }
  ];

  try {
    await AssetType.deleteMany({});
    const createdAssetTypes = await AssetType.create(assetTypes);
    console.log('Sample asset types created:', createdAssetTypes.length);
    return createdAssetTypes;
  } catch (error) {
    console.error('Error creating sample asset types:', error);
    return [];
  }
};

// Create sample users
const createSampleUsers = async (bases) => {
  if (!bases || bases.length === 0) {
    console.log('No bases available, creating admin user only...');
    const adminUser = {
      username: 'admin',
      email: 'admin@military.gov',
      password: 'admin123',
      role: 'admin',
      isActive: true
    };

    try {
      await User.deleteMany({});
      const createdUser = await User.create([adminUser]);
      console.log('Admin user created:', createdUser.length);
      return createdUser;
    } catch (error) {
      console.error('Error creating admin user:', error);
      return [];
    }
  }

  const users = [
    {
      username: 'admin',
      email: 'admin@military.gov',
      password: 'admin123',
      role: 'admin',
      isActive: true
    },
    {
      username: 'commander1',
      email: 'commander1@military.gov',
      password: 'commander123',
      role: 'commander',
      base: bases[0]._id,
      isActive: true
    },
    {
      username: 'logistics1',
      email: 'logistics1@military.gov',
      password: 'logistics123',
      role: 'logistics',
      base: bases[0]._id,
      isActive: true
    },
    {
      username: 'commander2',
      email: 'commander2@military.gov',
      password: 'commander123',
      role: 'commander',
      base: bases[1]._id,
      isActive: true
    },
    {
      username: 'logistics2',
      email: 'logistics2@military.gov',
      password: 'logistics123',
      role: 'logistics',
      base: bases[1]._id,
      isActive: true
    }
  ];

  try {
    await User.deleteMany({});
    const createdUsers = await User.create(users);
    console.log('Sample users created:', createdUsers.length);
    return createdUsers;
  } catch (error) {
    console.error('Error creating sample users:', error);
    return [];
  }
};

// Create sample assets
const createSampleAssets = async (bases, assetTypes) => {
  if (!bases.length || !assetTypes.length) {
    console.log('No bases or asset types available, skipping assets creation');
    return [];
  }

  const assets = [
    {
      assetId: 'AST-001',
      type: assetTypes.find(at => at.name === 'M4 Carbine')?._id,
      base: bases[0]._id,
      status: 'available',
      currentQuantity: 50,
      openingBalance: 50,
      purchaseDate: new Date('2023-01-15'),
      cost: 75000,
      specifications: { manufacturer: 'Colt', model: 'M4A1' }
    },
    {
      assetId: 'AST-002',
      type: assetTypes.find(at => at.name === '5.56mm Ammunition')?._id,
      base: bases[0]._id,
      status: 'available',
      currentQuantity: 10000,
      openingBalance: 10000,
      purchaseDate: new Date('2023-02-01'),
      cost: 5000,
      specifications: { manufacturer: 'Federal', grain: '62gr' }
    },
    {
      assetId: 'AST-003',
      type: assetTypes.find(at => at.name === 'Humvee')?._id,
      base: bases[1]._id,
      status: 'available',
      currentQuantity: 5,
      openingBalance: 5,
      purchaseDate: new Date('2023-03-10'),
      cost: 1000000,
      specifications: { manufacturer: 'AM General', year: '2023' }
    },
    {
      assetId: 'AST-004',
      type: assetTypes.find(at => at.name === 'Night Vision Goggles')?._id,
      base: bases[1]._id,
      status: 'available',
      currentQuantity: 25,
      openingBalance: 25,
      purchaseDate: new Date('2023-04-05'),
      cost: 125000,
      specifications: { manufacturer: 'L3Harris', model: 'AN/PVS-14' }
    }
  ];

  try {
    await Asset.deleteMany({});
    const createdAssets = await Asset.create(assets.filter(asset => asset.type));
    console.log('Sample assets created:', createdAssets.length);
    return createdAssets;
  } catch (error) {
    console.error('Error creating sample assets:', error);
    return [];
  }
};

// Create sample purchases
const createSamplePurchases = async (bases, assetTypes, users) => {
  if (!bases.length || !assetTypes.length || !users.length) {
    console.log('Missing required data, skipping purchases creation');
    return [];
  }

  const logisticsUser = users.find(u => u.role === 'logistics');
  if (!logisticsUser) {
    console.log('No logistics user found, skipping purchases creation');
    return [];
  }

  const purchases = [
    {
      purchaseId: 'PUR-001',
      assetType: assetTypes.find(at => at.name === 'MRE')?._id,
      base: bases[0]._id,
      quantity: 1000,
      unitCost: 12.50,
      totalCost: 12500,
      purchaseDate: new Date('2023-05-01'),
      purchasedBy: logisticsUser._id,
      supplier: 'Defense Logistics Agency',
      invoiceNumber: 'DLA-2023-001'
    },
    {
      purchaseId: 'PUR-002',
      assetType: assetTypes.find(at => at.name === '5.56mm Ammunition')?._id,
      base: bases[1]._id,
      quantity: 5000,
      unitCost: 0.50,
      totalCost: 2500,
      purchaseDate: new Date('2023-05-15'),
      purchasedBy: logisticsUser._id,
      supplier: 'Federal Premium',
      invoiceNumber: 'FED-2023-002'
    }
  ];

  try {
    await Purchase.deleteMany({});
    const createdPurchases = await Purchase.create(purchases.filter(purchase => purchase.assetType));
    console.log('Sample purchases created:', createdPurchases.length);
    return createdPurchases;
  } catch (error) {
    console.error('Error creating sample purchases:', error);
    return [];
  }
};

// Create sample expenditures - FIXED VERSION
const createSampleExpenditures = async (bases, assets, users) => {
  if (!bases.length || !assets.length || !users.length) {
    console.log('Missing required data, skipping expenditures creation');
    return [];
  }

  const logisticsUser = users.find(u => u.role === 'logistics');
  const commanderUser = users.find(u => u.role === 'commander');
  
  if (!logisticsUser || !commanderUser) {
    console.log('Required users not found, skipping expenditures creation');
    return [];
  }

  // Get assets that are consumable (ammunition, MRE) for expenditure
  const ammoAsset = assets.find(a => a.assetId === 'AST-002'); // 5.56mm Ammunition
  const rifleAsset = assets.find(a => a.assetId === 'AST-001'); // M4 Carbine

  const expenditures = [
    {
      asset: ammoAsset?._id,
      base: bases[0]._id,
      quantity: 500,
      reason: 'Training',
      description: 'Quarterly marksmanship training exercise',
      expendedBy: logisticsUser._id,
      expendedDate: new Date('2023-10-15'),
      approved: true,
      approvedBy: commanderUser._id,
      approvedDate: new Date('2023-10-15'),
      notes: 'Standard training expenditure for Q4 2023'
    },
    {
      asset: rifleAsset?._id,
      base: bases[0]._id,
      quantity: 2,
      reason: 'Maintenance',
      description: 'Weapons sent for maintenance and repair',
      expendedBy: logisticsUser._id,
      expendedDate: new Date('2023-10-10'),
      approved: true,
      approvedBy: commanderUser._id,
      approvedDate: new Date('2023-10-10'),
      notes: 'Scheduled maintenance for damaged weapons'
    },
    {
      asset: ammoAsset?._id,
      base: bases[0]._id,
      quantity: 1000,
      reason: 'Operations',
      description: 'Field operations ammunition expenditure',
      expendedBy: logisticsUser._id,
      expendedDate: new Date('2023-09-20'),
      approved: true,
      approvedBy: commanderUser._id,
      approvedDate: new Date('2023-09-21'),
      notes: 'Mission critical operations'
    }
  ];

  try {
    await Expenditure.deleteMany({});
    const validExpenditures = expenditures.filter(exp => exp.asset);
    const createdExpenditures = await Expenditure.create(validExpenditures);
    console.log('Sample expenditures created:', createdExpenditures.length);
    return createdExpenditures;
  } catch (error) {
    console.error('Error creating sample expenditures:', error);
    return [];
  }
};

// Main seeder function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    // Create sample data in order
    const bases = await createSampleBases();
    const assetTypes = await createSampleAssetTypes();
    const users = await createSampleUsers(bases);
    const assets = await createSampleAssets(bases, assetTypes);
    const purchases = await createSamplePurchases(bases, assetTypes, users);
    const expenditures = await createSampleExpenditures(bases, assets, users); // ADDED THIS LINE
    
    console.log('Database seeding completed successfully!');
    console.log('\n=== SUMMARY ===');
    console.log(`Bases created: ${bases.length}`);
    console.log(`Asset Types created: ${assetTypes.length}`);
    console.log(`Users created: ${users.length}`);
    console.log(`Assets created: ${assets.length}`);
    console.log(`Purchases created: ${purchases.length}`);
    console.log(`Expenditures created: ${expenditures.length}`); // ADDED THIS LINE
    
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin User:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nCommander User:');
    console.log('Username: commander1');
    console.log('Password: commander123');
    console.log('\nLogistics User:');
    console.log('Username: logistics1');
    console.log('Password: logistics123');
    console.log('========================\n');
    
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };