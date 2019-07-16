-- rambler up

CREATE TABLE session (
  "sid" varchar NOT NULL COLLATE "default",
	"data" json NOT NULL,
	"expires" timestamp(6) NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
  "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
)
WITH (OIDS=FALSE);
ALTER TABLE session ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;


-- rambler down

DROP TABLE session;