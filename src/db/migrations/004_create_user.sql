-- rambler up

CREATE TABLE "User" (
    id serial NOT NULL PRIMARY KEY,
    "lookupId" character varying(255) UNIQUE,
    email character varying(255) NOT NULL,
    "firstName" character varying(255),
    "lastName" character varying(255),
    "fullName" character varying(255),
    name character varying(255),
    hash character varying(255),
    "roleId" integer NOT NULL REFERENCES "Role"("id"),
    settings jsonb NOT NULL DEFAULT '{}',
    "deactivatedAt" timestamptz,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down

DROP TABLE "User";
