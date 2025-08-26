# Passkey Authentication Integration Guide

Complete guide to integrate passkey authentication into any Appwrite frontend project using this function.

## 🚀 Quick Setup

### 1. Deploy the Function

1. **Upload this function** to your Appwrite project
2. **Set Execute Access** to `Any` in function settings (for public access)
3. **Create Database Collections** in your `main` database:
   - **`challenges`** collection with fields:
     - `userId` (string)
     - `token` (string)
   - **`credentials`** collection with fields:
     - `userId` (string)
     - `credentials` (string)
4. **Note your function domain** from the Domains tab (e.g., `https://64d4d22db370ae41a32e.appwrite.global`)

### 2. Frontend Dependencies

Install required packages in your frontend project:

```bash
npm install appwrite @simplewebauthn/browser
```

### 3. Environment Configuration

```js
// config.js
export const config = {
  appwriteEndpoint: 'https://cloud.appwrite.io/v1',
  appwriteProjectId: '[YOUR_PROJECT_ID]',
  passkeyFunctionUrl: '[YOUR_FUNCTION_DOMAIN]', // From step 1.4
};
```

---

## 🔐 Implementation Options

### Option A: Separate Sign Up / Sign In Buttons

#### Setup Appwrite Client

```js
import { Client, Account } from 'appwrite';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { config } from './config.js';

const client = new Client()
  .setEndpoint(config.appwriteEndpoint)
  .setProject(config.appwriteProjectId);

const account = new Account(client);
```

#### Sign Up with Passkey

```js
async function signUpWithPasskey(email) {
  try {
    // 1. Start registration
    const startResponse = await fetch(
      `${config.passkeyFunctionUrl}/v1/challenges`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }

    const { options, challengeId } = await startResponse.json();

    // 2. Browser prompts for biometric
    const registration = await startRegistration(options);

    // 3. Complete registration
    const finishResponse = await fetch(
      `${config.passkeyFunctionUrl}/v1/challenges`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, registration }),
      }
    );

    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }

    return {
      success: true,
      message: 'Passkey registered! You can now sign in.',
    };
  } catch (error) {
    throw new Error(`Registration failed: ${error.message}`);
  }
}
```

#### Sign In with Passkey

```js
async function signInWithPasskey(email) {
  try {
    // 1. Start authentication
    const startResponse = await fetch(
      `${config.passkeyFunctionUrl}/v1/tokens`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }
    );

    if (!startResponse.ok) {
      throw new Error(await startResponse.text());
    }

    const { options, challengeId } = await startResponse.json();

    // 2. Browser prompts for biometric
    const authentication = await startAuthentication(options);

    // 3. Complete authentication
    const finishResponse = await fetch(
      `${config.passkeyFunctionUrl}/v1/tokens`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, authentication }),
      }
    );

    if (!finishResponse.ok) {
      throw new Error(await finishResponse.text());
    }

    const { userId, secret } = await finishResponse.json();

    // 4. Create Appwrite session
    await account.createSession(userId, secret);

    return { success: true, user: await account.get() };
  } catch (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
}
```

### Option B: Smart "Continue with Passkey" Button

Single button that intelligently handles both signup and signin:

```js
async function continueWithPasskey(email) {
  try {
    // Try sign in first
    return await signInWithPasskey(email);
  } catch (error) {
    // If no credentials found, auto-register then sign in
    if (error.message.includes('No credentials found')) {
      await signUpWithPasskey(email);
      return await signInWithPasskey(email);
    }
    throw error;
  }
}
```

---

## 🎨 UI Examples

### React Example

```jsx
import { useState } from 'react';

function PasskeyAuth() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleContinueWithPasskey = async () => {
    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await continueWithPasskey(email);
      setMessage(`Welcome ${result.user.email}!`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        disabled={loading}
      />
      <button onClick={handleContinueWithPasskey} disabled={loading || !email}>
        {loading ? 'Authenticating...' : '🔐 Continue with Passkey'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}
```

### Vue Example

```vue
<template>
  <div>
    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      :disabled="loading"
    />
    <button @click="handleContinueWithPasskey" :disabled="loading || !email">
      {{ loading ? 'Authenticating...' : '🔐 Continue with Passkey' }}
    </button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      loading: false,
      message: '',
    };
  },
  methods: {
    async handleContinueWithPasskey() {
      if (!this.email) {
        this.message = 'Please enter your email';
        return;
      }

      this.loading = true;
      this.message = '';

      try {
        const result = await continueWithPasskey(this.email);
        this.message = `Welcome ${result.user.email}!`;
      } catch (error) {
        this.message = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
```

---

## ⚙️ Advanced Configuration

### Custom Error Handling

```js
function handlePasskeyError(error) {
  if (error.name === 'NotSupportedError') {
    return 'Passkeys are not supported on this device/browser';
  }
  if (error.name === 'SecurityError') {
    return 'Security error - please try again';
  }
  if (error.name === 'AbortError') {
    return 'Authentication was cancelled';
  }
  return error.message || 'Authentication failed';
}
```

### User Session Management

```js
// Check if user is logged in
async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

// Sign out
async function signOut() {
  await account.deleteSession('current');
}
```

### Browser Support Detection

```js
function isPasskeySupported() {
  return (
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
}
```

---

## 🔧 Environment Variables

The function automatically configures itself using Appwrite's built-in environment variables:

- `APPWRITE_FUNCTION_API_ENDPOINT` - Auto-set by Appwrite
- `APPWRITE_FUNCTION_PROJECT_ID` - Auto-set by Appwrite
- `APPWRITE_API_KEY` - Auto-set by Appwrite

**No manual environment configuration needed!**

---

## 🔒 Security Features

- ✅ **Platform authenticators preferred** (Touch ID, Windows Hello, etc.)
- ✅ **User verification required** (biometric/PIN confirmation)
- ✅ **Origin validation** (prevents CSRF attacks)
- ✅ **Challenge cleanup** (prevents replay attacks)
- ✅ **Cryptographic verification** (WebAuthn standard compliance)

---

## 📱 Browser Support

**Fully Supported:**

- Chrome 67+ (Android, Desktop)
- Safari 14+ (iOS, macOS)
- Firefox 60+ (Desktop)
- Edge 18+ (Desktop, Mobile)

**Limited Support:**

- Older browsers (graceful degradation recommended)

---

## 🐛 Troubleshooting

### Common Issues

**"Passkeys not supported"**

- Ensure HTTPS (required for WebAuthn)
- Check browser compatibility
- Verify device has biometric/PIN setup

**"No credentials found"**

- User hasn't registered a passkey yet
- Use the smart button (Option B) for auto-registration

**"Origin mismatch"**

- Ensure your frontend domain matches the configured origin
- Check if running on localhost vs production

**"Security error"**

- Verify HTTPS is enabled
- Check if running in a secure context
- Ensure no mixed content warnings

### Debug Mode

```js
// Add to see detailed error information
window.addEventListener('unhandledrejection', (event) => {
  console.error('Passkey error:', event.reason);
});
```

---

## 💡 Best Practices

1. **Always use HTTPS** in production (required for WebAuthn)
2. **Provide fallback authentication** (email/password) for unsupported devices
3. **Clear user messaging** about biometric requirements
4. **Handle edge cases** gracefully (cancelled prompts, unsupported browsers)
5. **Test across devices** (iOS Safari, Android Chrome, Desktop browsers)

This integration provides a seamless, secure passkey authentication experience that works across all modern devices and browsers!
