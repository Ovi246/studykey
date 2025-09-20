import { Text, View } from 'react-native';

export default function FontTestVerification() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-6 text-center">Font Test Verification</Text>
      
      <View className="w-full max-w-md">
        <Text className="text-lg mb-4 p-3 bg-gray-100 rounded">
          1. Default text (no font class)
        </Text>
        
        <Text className="text-lg mb-4 p-3 bg-blue-100 rounded font-sans">
          2. font-sans - Should use Comic Sans
        </Text>
        
        <Text className="text-lg mb-4 p-3 bg-green-100 rounded font-comic">
          3. font-comic - Should use Comic Sans
        </Text>
        
        <Text className="text-lg mb-4 p-3 bg-yellow-100 rounded font-comic-bold">
          4. font-comic-bold - Should use Comic Sans Bold
        </Text>
        
        <Text className="text-lg mb-4 p-3 bg-purple-100 rounded font-comic-sans">
          5. font-comic-sans - Should use Comic Sans
        </Text>
        
        {/* Direct font reference */}
        <Text style={{ fontFamily: 'ComicSansMSBold' }} className="text-lg mb-4 p-3 bg-red-100 rounded">
          6. Direct font reference - ComicSansMSBold
        </Text>
        
        <Text style={{ fontFamily: 'Comic Sans MS Bold' }} className="text-lg mb-4 p-3 bg-red-100 rounded">
          7. Direct font reference - Comic Sans MS Bold
        </Text>
      </View>
      
      <Text className="mt-8 text-center text-gray-500">
        Compare the font styles above to see if they're different from the default system font.
      </Text>
    </View>
  );
}