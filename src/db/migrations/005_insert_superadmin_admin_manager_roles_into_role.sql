-- rambler up
INSERT INTO "Role" (type)
VALUES ('superadmin'),
  ('admin'),
  ('standard'),
  ('external');

-- rambler down

DELETE FROM "Role" WHERE type='superadmin';
DELETE FROM "Role" WHERE type='admin';
DELETE FROM "Role" WHERE type='standard';
DELETE FROM "Role" WHERE type='external';
