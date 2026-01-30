# Academic Integrity Analyzer

An AI-powered tool for educators to assess student work for potential AI assistance. Upload student documents and receive detailed originality reports with specific evidence and actionable recommendations.

![Academic Integrity Analyzer](https://img.shields.io/badge/Next.js-14-black) ![Claude API](https://img.shields.io/badge/Claude-API-orange)

## Features

- 📄 **Document Upload**: Drag-and-drop support for `.docx` and `.txt` files
- 🎓 **Student Context**: Configure educational level, ability, and subject for accurate assessment
- 🔍 **Dual Analysis**: Local pattern detection + AI-powered deep analysis
- 📊 **Comprehensive Reports**: Section-by-section breakdown, red flags, and confidence scores
- 🖨️ **Print-Ready**: Professional reports suitable for records
- 🔒 **Secure**: API keys stored server-side, never exposed to browsers

## Quick Deploy to Vercel

### Step 1: Get an Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys** and create a new key
4. Copy the key (starts with `sk-ant-`)

### Step 2: Deploy to Vercel

**Option A: Deploy via GitHub (Recommended)**

1. Fork or push this repository to your GitHub account
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Before deploying, add your environment variable:
   - Click **"Environment Variables"**
   - Add: `ANTHROPIC_API_KEY` = `your-api-key-here`
6. Click **"Deploy"**

**Option B: Deploy via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Add your API key
vercel env add ANTHROPIC_API_KEY
# Paste your key when prompted, select all environments

# Redeploy to apply the environment variable
vercel --prod
```

### Step 3: Access Your App

Once deployed, Vercel will give you a URL like:
- `https://ai-integrity-checker.vercel.app`
- Or with your account: `https://ai-integrity-checker-yourusername.vercel.app`

You can add a custom domain in Vercel's project settings.

## Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-integrity-checker.git
cd ai-integrity-checker

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
ai-integrity-checker/
├── app/
│   ├── api/
│   │   └── analyze/
│   │       └── route.js    # Secure API endpoint for Claude
│   ├── globals.css         # Styles
│   ├── layout.js           # Root layout with fonts
│   └── page.js             # Main application component
├── .env.example            # Environment variable template
├── .gitignore
├── next.config.js
├── package.json
└── README.md
```

## How It Works

1. **Upload**: Teacher uploads a student's `.docx` or `.txt` file
2. **Context**: Teacher provides student level, ability, and subject
3. **Local Analysis**: App scans for 35+ known AI indicator phrases
4. **AI Analysis**: Document sent to Claude API for deep analysis
5. **Report**: Comprehensive report with:
   - Overall verdict and confidence score
   - Suspected AI tool identification
   - Section-by-section analysis
   - Red flags with severity ratings
   - Authentic elements detected
   - Recommended questions for the student

## Security Notes

- **API Key**: Stored as environment variable, never sent to browser
- **Data**: Documents are processed but not stored
- **Privacy**: No student data retained after analysis

## Customization

### Adding More AI Indicator Phrases

Edit the `AI_INDICATORS` object in `app/page.js`:

```javascript
const AI_INDICATORS = {
  phrases: [
    { text: "your phrase here", weight: 2, tool: "ChatGPT" },
    // weight: 1 (low), 2 (medium), 3 (high significance)
    // tool: "ChatGPT", "Claude", "Gemini", or "Generic"
  ]
};
```

### Changing Educational Levels

Edit the `levelMap` in both `app/page.js` and `app/api/analyze/route.js`.

## Cost Considerations

- Each analysis uses approximately 1,000-4,000 Claude API tokens
- At current Anthropic pricing, roughly $0.01-0.05 per analysis
- Consider setting up usage limits in your Anthropic console

## Support

For issues or feature requests, please open a GitHub issue.

## License

MIT License - Free for educational use.

---

Built with [Next.js](https://nextjs.org/) and [Claude API](https://anthropic.com/)
