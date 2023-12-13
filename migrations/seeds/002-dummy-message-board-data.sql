-- migrations/seeds/002-dummy-message-board-data.sql

-- Seed data for Categories
INSERT INTO categories (title, description) VALUES
('General Discussion', 'A place for general chit-chat and topics that don''t fit elsewhere.'),
('News and Announcements', 'Official news and announcements from the forum administrators.'),
('Feedback', 'Share your feedback and suggestions about the forum.'),
('Support', 'Need help? Post your questions and get support here.'),
('Off-Topic', 'The place for conversations that don''t necessarily relate to the other forums.'),
('Tech Talk', 'Discussion about technology, programming, and development.'),
('Gaming', 'For discussions about video games, gaming hardware, and the gaming industry.'),
('Entertainment', 'Movies, music, television and other forms of entertainment.'),
('Sports', 'Talk about your favorite sports, teams, events, and athletes.');

-- Note: Ensure an admin user is registered with the user ID provided below for seeding purposes.
-- The following user ID should be replaced with the actual admin user ID after registration.
-- User ID used here as an example: bb8255f7-60f6-4e67-a08b-6ce78d4125a3

-- Seed data for Welcome Threads by Admin
INSERT INTO threads (category_id, user_id, title, pinned, locked)
VALUES
  ((SELECT id FROM categories WHERE title = 'General Discussion'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to the General Discussion Forum!', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'News and Announcements'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to News and Announcements', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Feedback'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Feedback', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Support'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Support', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Off-Topic'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Off-Topic', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Tech Talk'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Tech Talk', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Gaming'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Gaming', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Entertainment'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Entertainment', TRUE, FALSE),
  ((SELECT id FROM categories WHERE title = 'Sports'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome to Sports', TRUE, FALSE);


INSERT INTO posts (thread_id, user_id, content)
VALUES
  ((SELECT id FROM threads WHERE title = 'Welcome to the General Discussion Forum!'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Welcome everyone to the General Discussion forum! Feel free to share anything that''s on your mind.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to News and Announcements'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Stay tuned for the latest news and announcements about our forum.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Feedback'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Your feedback is invaluable to us. Let us know your thoughts and suggestions.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Support'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Need help? Feel free to ask your questions here, and we''ll do our best to assist you.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Off-Topic'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'This is your space for any off-topic chat. What''s on your mind today?'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Tech Talk'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Let''s talk about technology, programming, and everything in between.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Gaming'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Gamers unite! Discuss your favorite games, gaming news, and strategies.'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Entertainment'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Movies, music, TV shows, and more! What''s your favorite form of entertainment?'),
  ((SELECT id FROM threads WHERE title = 'Welcome to Sports'), 'bb8255f7-60f6-4e67-a08b-6ce78d4125a3', 'Sports enthusiasts gather here! Share your love for sports, teams, and athletes.');
