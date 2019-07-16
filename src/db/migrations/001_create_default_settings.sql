-- rambler up

CREATE TABLE "DefaultSettings" (
    key citext PRIMARY KEY CHECK(key ~* '^[a-z0-9\._]+$' AND length(key) < 255),
    value jsonb,
    description text,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "DefaultSettings";