# Classic Zone – Setup (Bangla/English mix)

## Test (Firebase chhara)
index.html open korun. Demo mode: data shudhu ai browser e thake. Admin: admin.html, password `demo`.

## Real live site (Firebase – free Spark plan)
1. console.firebase.google.com → Add project.
2. Build → Authentication → Sign-in method → Email/Password ENABLE → Users → Add user: mdforied30@gmail.com + apnar password.
3. Build → Firestore Database → Create (production mode) → Rules tab e `firestore.rules` er content paste kore Publish.
4. Project settings → Your apps → Web (</>) → config copy kore `js/firebase-config.js` e paste korun.
5. GitHub e push → Netlify e deploy. Netlify te Firebase "Authorized domains" e apnar netlify domain add korun (Authentication → Settings).
