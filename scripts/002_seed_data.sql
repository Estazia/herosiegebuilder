-- Seed data for Hero Siege Builds

-- Insert sample tier lists
INSERT INTO public.tier_lists (category, data) VALUES
('Overall Endgame', '{
  "S": [
    {"id": "1", "class": "Necromancer", "name": "Skeleton Army", "label": "Best AoE"},
    {"id": "2", "class": "Pyromancer", "name": "Fire Nova", "label": "High DPS"}
  ],
  "A": [
    {"id": "3", "class": "Samurai", "name": "Blade Storm", "label": "Melee King"},
    {"id": "4", "class": "Amazon", "name": "Lightning Strike", "label": "Ranged"}
  ],
  "B": [
    {"id": "5", "class": "Paladin", "name": "Holy Shield", "label": "Tanky"},
    {"id": "6", "class": "Viking", "name": "Berserker", "label": "High Risk"}
  ],
  "C": [
    {"id": "7", "class": "Shaman", "name": "Totem Master", "label": "Support"}
  ],
  "D": []
}'::jsonb),
('Leveling', '{
  "S": [
    {"id": "1", "class": "Pyromancer", "name": "Fire AoE", "label": "Fast Clear"},
    {"id": "2", "class": "Necromancer", "name": "Summon Build", "label": "Safe"}
  ],
  "A": [
    {"id": "3", "class": "Marauder", "name": "Cleave", "label": "Easy"},
    {"id": "4", "class": "Viking", "name": "Whirlwind", "label": "Fun"}
  ],
  "B": [
    {"id": "5", "class": "Amazon", "name": "Multi-Shot", "label": "Gear Dependent"}
  ],
  "C": [],
  "D": []
}'::jsonb),
('Bossing', '{
  "S": [
    {"id": "1", "class": "Samurai", "name": "Execute Build", "label": "Boss Killer"},
    {"id": "2", "class": "Demonspawn", "name": "Demon Form", "label": "High Burst"}
  ],
  "A": [
    {"id": "3", "class": "Necromancer", "name": "Bone Spear", "label": "Safe DPS"},
    {"id": "4", "class": "Paladin", "name": "Smite", "label": "Survivable"}
  ],
  "B": [
    {"id": "5", "class": "Pyromancer", "name": "Meteor", "label": "Glass Cannon"}
  ],
  "C": [],
  "D": []
}'::jsonb),
('Speed Farming', '{
  "S": [
    {"id": "1", "class": "Nomad", "name": "Speed Demon", "label": "Fastest"},
    {"id": "2", "class": "Pirate", "name": "Cannon Build", "label": "AoE King"}
  ],
  "A": [
    {"id": "3", "class": "Pyromancer", "name": "Fire Trail", "label": "Smooth"},
    {"id": "4", "class": "Amazon", "name": "Lightning Run", "label": "Fun"}
  ],
  "B": [],
  "C": [],
  "D": []
}'::jsonb)
ON CONFLICT (category) DO UPDATE SET data = EXCLUDED.data;

-- Insert sample bosses
INSERT INTO public.bosses (name, slug, location, difficulty, lore, attack_patterns, loot_table) VALUES
('Damien the Fallen', 'damien-the-fallen', 'Act 5 - Cathedral of Sin', 'Inferno', 
 'Once a holy paladin, Damien was corrupted by demonic forces and now guards the entrance to the Abyss.',
 '[{"name": "Holy Corruption", "description": "Releases waves of corrupted light that deal heavy damage", "damage_type": "Holy/Shadow"},
   {"name": "Fallen Smite", "description": "Slams the ground creating shockwaves", "damage_type": "Physical"},
   {"name": "Summon Fallen", "description": "Summons corrupted angels to fight alongside him", "damage_type": "N/A"}]'::jsonb,
 '[{"name": "Damien''s Corrupted Blade", "drop_rate": 2, "rarity": "Legendary"},
   {"name": "Fallen Angel Wings", "drop_rate": 5, "rarity": "Epic"},
   {"name": "Holy Corruption Gem", "drop_rate": 15, "rarity": "Rare"}]'::jsonb),

('The Worm King', 'the-worm-king', 'Act 3 - Underground Caverns', 'Hell',
 'A massive creature that has devoured countless adventurers. Its body spans the entire cavern.',
 '[{"name": "Burrow", "description": "Burrows underground and emerges beneath players", "damage_type": "Physical"},
   {"name": "Acid Spit", "description": "Spits corrosive acid in a cone", "damage_type": "Poison"},
   {"name": "Swarm", "description": "Releases smaller worms that chase players", "damage_type": "Physical"}]'::jsonb,
 '[{"name": "Worm King Crown", "drop_rate": 3, "rarity": "Legendary"},
   {"name": "Acidic Core", "drop_rate": 10, "rarity": "Epic"},
   {"name": "Worm Tooth", "drop_rate": 25, "rarity": "Rare"}]'::jsonb),

('Frost Queen Elara', 'frost-queen-elara', 'Act 4 - Frozen Throne', 'Nightmare',
 'The ruler of the frozen wastes, she commands the power of eternal winter.',
 '[{"name": "Blizzard", "description": "Creates a massive blizzard that slows and damages", "damage_type": "Cold"},
   {"name": "Ice Lance", "description": "Fires piercing ice projectiles", "damage_type": "Cold"},
   {"name": "Frozen Prison", "description": "Encases players in ice for a duration", "damage_type": "Cold"}]'::jsonb,
 '[{"name": "Elara''s Frozen Heart", "drop_rate": 4, "rarity": "Legendary"},
   {"name": "Crown of Winter", "drop_rate": 8, "rarity": "Epic"},
   {"name": "Frost Crystal", "drop_rate": 20, "rarity": "Rare"}]'::jsonb);

-- Insert sample map markers
INSERT INTO public.map_markers (name, description, category, lat, lng, loot_info) VALUES
('Starting Village', 'The first safe zone where players begin their journey', 'Zones', 50.0, 50.0, '[]'::jsonb),
('Dark Forest', 'A dangerous forest filled with undead creatures', 'Zones', 45.0, 55.0, '[{"name": "Wolf Pelt", "drop_rate": 30}]'::jsonb),
('Ancient Ruins', 'Mysterious ruins containing powerful artifacts', 'Zones', 40.0, 60.0, '[{"name": "Ancient Scroll", "drop_rate": 15}]'::jsonb),
('Damien''s Cathedral', 'The lair of Damien the Fallen', 'Bosses', 35.0, 65.0, '[]'::jsonb),
('Hidden Treasure Cave', 'A secret cave with guaranteed rare loot', 'Secrets', 42.0, 48.0, '[{"name": "Treasure Chest", "drop_rate": 100}]'::jsonb),
('Blood Moon Event', 'Special event that spawns during blood moons', 'Events', 55.0, 45.0, '[]'::jsonb);
