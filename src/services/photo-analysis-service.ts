import Anthropic from '@anthropic-ai/sdk';

export interface AnalyzedFood {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  confidence: 'high' | 'medium' | 'low';
}

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

const client = new Anthropic({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true, // Required for browser-based apps
});

export const PhotoAnalysisService = {
  analyzeFood: async (imageBase64: string): Promise<AnalyzedFood[]> => {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: `Analyze this food image and identify all visible food items. For each food item, provide:
1. Food name
2. Estimated calories (per serving or total visible)
3. Estimated macros (protein, carbs, fat in grams)
4. Confidence level (high/medium/low)

Format your response as JSON array like this:
[
  {
    "name": "Pizza slice",
    "calories": 285,
    "protein": 12,
    "carbs": 36,
    "fat": 10,
    "confidence": "high"
  }
]

If you cannot identify any food clearly, return an empty array [].
Only return valid JSON, no other text.`,
              },
            ],
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type');
      }

      // Parse the JSON response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON found in response:', content.text);
        return [];
      }

      const foods = JSON.parse(jsonMatch[0]) as AnalyzedFood[];
      return foods;
    } catch (error) {
      console.error('Error analyzing photo:', error);
      throw error;
    }
  },

  getApiKey: (): string => {
    const key = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    return key;
  },
};
