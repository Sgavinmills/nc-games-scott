\c nc_games_test


--want all reviews that a user has commented on
SELECT reviews.review_id, title, owner as review_writer, comments.author as comment_writer  
FROM reviews
JOIN comments
ON reviews.review_id = comments.review_id
JOIN users 
ON comments.author = users.username
WHERE comments.author = 'mallionaire';
