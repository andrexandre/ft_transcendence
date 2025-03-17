
-- BEGIN TRANSACTION;

-- WITH indice AS (
-- 	SELECT key, value
-- 	FROM json_each((SELECT friends FROM users WHERE id = :requesteeID ))
-- 	WHERE json_extract(value, '$.requestorID') = :requestorID
-- )
-- SELECT * FROM indice;
-- UPDATE users 
-- SET friends = json_set(
-- 	friends,
-- 	'$[' || (SELECT key FROM indice) || ']',
-- 	json_object('friendship', 'true', 'friendID', :requestorID, 'friendshipStatus', :status)
-- )
-- WHERE id = :requesteeID;


-- WITH indice AS (
-- 	SELECT key, value
-- 	FROM json_each((SELECT friends FROM users WHERE id = :requestorID ))
-- 	WHERE json_extract(value, '$.requesteeID') = :requesteeID
-- )
-- UPDATE users 
-- SET friends = json_set(
-- 	friends,
-- 	'$[' || (SELECT key FROM indice) || ']',
-- 	json_object('friendship', 'true', 'friendID', :requesteeID, 'friendshipStatus', :status)
-- )
-- WHERE id = :requestorID;

-- COMMIT; 




