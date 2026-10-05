# Architecture rules

- Route-level pages must be loaded with `React.lazy` so public mobile visits do not download booking, admin, and owner interfaces upfront.
- The startup loader may preload only the hero asset needed by the current route so it does not compete with the visible page for mobile bandwidth.