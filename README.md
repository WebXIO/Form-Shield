# Form-Shield

Layered spam protection for contact forms utilizing [Cap.js](https://capjs.js.org/).

## Features

- **Honeypot Detection** - Hidden field traps for naive bots
- **Content Filtering** - Detect gibberish, spam keywords, excessive URLs
- **Cap.js Integration** - Privacy-friendly proof-of-work captcha verification
- **HTML Sanitization** - Escape user input to prevent XSS
- **Fully Configurable** - Customize thresholds and patterns
- **TypeScript First** - Full type definitions included

## Installation

This package is hosted on GitHub Packages. First, configure your project to use the GitHub registry for `@webxio` packages:

**1. Create or update `.npmrc` in your project root:**
```
@webxio:registry=https://npm.pkg.github.com
```

**2. Authenticate with GitHub Packages:**
```bash
npm login --registry=https://npm.pkg.github.com
# Username: your-github-username
# Password: your-github-personal-access-token (with read:packages scope)
```

**3. Install the package:**
```bash
# npm
npm install @webxio/form-shield @cap.js/server

# pnpm
pnpm add @webxio/form-shield @cap.js/server
```

> **Note:** Requires a self-hosted Cap.js server. See [Cap.js documentation](https://capjs.js.org/).

## Quick Start

```typescript
import { FormShield } from '@webxio/form-shield';

const shield = new FormShield({
  capjs: {
    apiEndpoint: process.env.CAP_API_ENDPOINT!,
    siteKey: process.env.CAP_SITE_KEY!,
    secretKey: process.env.CAP_SECRET_KEY!,
  },
});

// In your form handler
const result = await shield.validate({
  name: formData.get('name'),
  email: formData.get('email'),
  message: formData.get('message'),
  capToken: formData.get('capToken'),
  website: formData.get('website'), // honeypot field
});

if (!result.valid) {
  console.log(`[SPAM] Layer: ${result.layer} | Reason: ${result.reason}`);
  throw new Error('Spam detected');
}

// Process legitimate submission...
```

## Configuration

```typescript
const shield = new FormShield({
  // Honeypot settings
  honeypot: {
    fieldName: 'website', // default
  },
  
  // Content filter settings
  contentFilter: {
    minVowelRatio: 0.15,      // Minimum vowel ratio (default: 0.15)
    maxConsonantCluster: 5,    // Max consecutive consonants (default: 5)
    maxUrls: 2,                // Max URLs in message (default: 2)
    allowDigitsInName: false,  // Allow numbers in name (default: false)
    maxNamePunctuation: 2,     // Max punctuation in name (default: 2)
    customPatterns: [          // Additional spam patterns
      /\bfree money\b/i,
    ],
  },
  
  // Cap.js settings (required)
  capjs: {
    apiEndpoint: process.env.CAP_API_ENDPOINT!,
    siteKey: process.env.CAP_SITE_KEY!,
    secretKey: process.env.CAP_SECRET_KEY!,
  },
});
```

## Individual Functions

Use individual functions for custom validation flows:

```typescript
import { 
  checkHoneypot, 
  detectSpam, 
  verifyCapToken,
  escapeHtml 
} from '@webxio/form-shield';

// Check honeypot
const honeypot = checkHoneypot(formData.get('website'));
if (honeypot.triggered) {
  // Bot detected
}

// Check content
const spam = detectSpam({ name, email, message });
if (spam.isSpam) {
  console.log('Spam reasons:', spam.reasons);
}

// Verify Cap.js token
const cap = await verifyCapToken({
  apiEndpoint: '...',
  siteKey: '...',
  secretKey: '...',
  token: capToken,
});
if (!cap.success) {
  // Captcha failed
}

// Sanitize for HTML output
const safeMessage = escapeHtml(message);
```

## Validation Layers

Form-Shield validates in order, stopping at the first failure:

| Layer | What it catches |
|-------|-----------------|
| 1. Honeypot | Bots that fill hidden fields |
| 2. Content Filter | Gibberish, spam keywords, excessive URLs |
| 3. Cap.js | Mass spam (economic deterrent via PoW) |

## Frontend Setup

Add a honeypot field to your form (hidden from users):

```html
<!-- Hidden honeypot field -->
<div style="position: absolute; left: -9999px;" aria-hidden="true">
  <input type="text" name="website" tabindex="-1" autocomplete="off" />
</div>
```

For Cap.js widget setup, see the [Cap.js documentation](https://capjs.js.org/).

## Acknowledgments

- [Cap.js](https://capjs.js.org/) - Privacy-friendly proof-of-work captcha

## License

MIT © WebXIO