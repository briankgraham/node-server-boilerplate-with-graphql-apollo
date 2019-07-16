-- rambler up
--
-- Name: Role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE "Role" (
    id serial NOT NULL PRIMARY KEY,
    type CITEXT CHECK(length("type") < 255),
    "createdAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz,
    "updatedAt" timestamptz NOT NULL DEFAULT timezone('utc', now())::timestamptz
);

-- rambler down
DROP TABLE "Role";