# Photo Analysis Setup

The photo feature uses Claude's vision API to analyze food photos. To enable it:

## 1. Get an API Key

1. Go to https://console.anthropic.com
2. Sign in or create an account
3. Click "API Keys" in the sidebar
4. Create a new API key
5. Copy the key

## 2. Configure the App

Create a `.env.local` file in the project root:

```bash
echo "EXPO_PUBLIC_ANTHROPIC_API_KEY=your_api_key_here" > .env.local
```

Replace `your_api_key_here` with your actual API key from step 1.

## 3. Restart the App

```bash
npm run web
```

Then visit http://localhost:8081 and click the **Photo** tab to test!

## How It Works

1. **Take or upload a photo** of your food
2. **Claude analyzes** the image using computer vision
3. **Identifies food items** and estimates:
   - Calories
   - Protein, carbs, fat
   - Confidence level
4. **Select which items** to add to your tracker
5. **Data is logged** instantly

## Privacy & Safety

- Photos are NOT stored on our servers
- Only sent to Anthropic's API for analysis
- Data deleted after analysis
- Require your own API key (your credit card, your control)

## Troubleshooting

**"API key not set" error:**
- Make sure `.env.local` file exists
- Check the API key is correct
- Restart the dev server

**"No food detected":**
- Make sure the photo clearly shows food
- Try a different angle or better lighting
- Claude works best with distinct food items

**API errors:**
- Check your API key has credits
- Visit https://console.anthropic.com to manage billing
