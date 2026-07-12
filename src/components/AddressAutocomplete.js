import { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

let placesPromise = null;

// Uses Google's official inline bootstrap loader, which installs
// `google.maps.importLibrary`. Then imports the "places" library.
// https://developers.google.com/maps/documentation/javascript/load-maps-js-api
function loadPlaces() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('no window'));
  }
  if (placesPromise) return placesPromise;
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(
      new Error('Missing REACT_APP_GOOGLE_MAPS_API_KEY in .env')
    );
  }

  placesPromise = new Promise((resolve, reject) => {
    try {
      // Inline bootstrap loader (from Google docs, formatted for readability).
      // It installs `google.maps.importLibrary` synchronously.
      // eslint-disable-next-line no-unused-expressions
      ((g) => {
        // eslint-disable-next-line prefer-const, no-var
        var h,
          a,
          k,
          p = 'The Google Maps JavaScript API',
          c = 'google',
          l = 'importLibrary',
          q = '__ib__',
          m = document,
          b = window;
        b = b[c] || (b[c] = {});
        var d = b.maps || (b.maps = {}),
          r = new Set(),
          e = new URLSearchParams(),
          u = () =>
            h ||
            (h = new Promise((f, n) => {
              a = m.createElement('script');
              e.set('libraries', [...r] + '');
              for (k in g)
                e.set(
                  k.replace(/[A-Z]/g, (t) => '_' + t[0].toLowerCase()),
                  g[k]
                );
              e.set('callback', c + '.maps.' + q);
              a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
              d[q] = f;
              a.onerror = () => (h = n(Error(p + ' could not load.')));
              a.nonce = m.querySelector('script[nonce]')?.nonce || '';
              m.head.append(a);
            }));
        d[l]
          ? // eslint-disable-next-line no-console
            console.warn(p + ' only loads once. Ignoring:', g)
          : (d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)));
      })({
        key: GOOGLE_MAPS_API_KEY,
        v: 'weekly',
      });

      window.google.maps
        .importLibrary('places')
        .then((places) => resolve({ google: window.google, places }))
        .catch((err) => {
          placesPromise = null;
          reject(err);
        });
    } catch (err) {
      placesPromise = null;
      reject(err);
    }
  });
  return placesPromise;
}

/**
 * Address input with Google Places Autocomplete.
 */
const AddressAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search address',
  autoFocus = false,
  className,
}) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let cancelled = false;
    loadPlaces()
      .then(({ places }) => {
        if (cancelled || !inputRef.current || autocompleteRef.current) return;
        const ac = new places.Autocomplete(inputRef.current, {
          fields: ['formatted_address'],
          types: ['address'],
        });
        autocompleteRef.current = ac;
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (place && place.formatted_address) {
            onChange(place.formatted_address);
          }
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={className}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {loadError && (
        <span className="address-autocomplete-warning">{loadError}</span>
      )}
    </>
  );
};

export default AddressAutocomplete;


