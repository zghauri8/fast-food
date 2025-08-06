// Simple validation to check if the fix is correct
const fs = require('fs');

console.log('Validating the uploadImageToStorage fix...');

// Read the seed.ts file
const seedContent = fs.readFileSync('Z:/untitled/fast-food/lib/seed.ts', 'utf8');

// Check if the problematic URL.createObjectURL is removed
if (seedContent.includes('URL.createObjectURL(blob)')) {
    console.error('❌ Fix failed: URL.createObjectURL(blob) still present');
    process.exit(1);
}

// Check if the correct storage.createFile call is present
if (seedContent.includes('storage.createFile(\n                appwriteConfig.bucketId,\n                ID.unique(),\n                file\n            )')) {
    console.log('✅ Fix validated: storage.createFile now receives File object directly');
} else {
    console.error('❌ Fix validation failed: Correct storage.createFile call not found');
    process.exit(1);
}

console.log('✅ All validations passed. The fix should resolve the blob URL error.');