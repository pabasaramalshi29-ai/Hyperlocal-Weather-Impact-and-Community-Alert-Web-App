import { useEffect } from 'react';

const FacebookLoginButton = ({ onLogin }) => {
  useEffect(() => {
    if (window.FB) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '1234567890',
        cookie: true,
        xfbml: false,
        version: 'v16.0',
      });
    };

    (function (d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    })(document, 'script', 'facebook-jssdk');
  }, []);

  const handleClick = () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return;
    }

    window.FB.login(
      function (response) {
        if (response.authResponse) {
          window.FB.api('/me', { fields: 'id,name,email,picture' }, function (profile) {
            const res = {
              accessToken: response.authResponse.accessToken,
              userID: profile.id,
              name: profile.name,
              email: profile.email,
              picture: { data: { url: profile.picture?.data?.url || (profile.picture && profile.picture.data && profile.picture.data.url) } },
            };
            onLogin && onLogin(res);
          });
        } else {
          console.log('User cancelled login or did not fully authorize.');
        }
      },
      { scope: 'email,public_profile' }
    );
  };

  return (
    <button className="facebook-signup-button" onClick={handleClick}>
      Continue with Facebook
    </button>
  );
};

export default FacebookLoginButton;
