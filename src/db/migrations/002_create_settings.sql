-- rambler up

CREATE TABLE "Settings" (
    key citext NOT NULL REFERENCES "DefaultSettings"(key) ON DELETE RESTRICT,
    value jsonb,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "Settings";
