-- rambler up
-- Name: DataSet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "DataSet" (
    id serial NOT NULL PRIMARY KEY,
    title CITEXT NOT NULL CHECK(length("title") < 255),
    "mongoId" text,
    "userId" integer NOT NULL REFERENCES "User"("id"),
    "deactivatedAt" timestamptz,
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "language" character varying(255)
);

-- rambler down
DROP TABLE "DataSet";
