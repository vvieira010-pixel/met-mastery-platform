const IMAGE_DIR = '/exercises/speaking/image-description';

const prompts = [
  ['stadium', 'Describe the football match. Mention the setting, the players, the goalkeeper, the camera operator, and the spectators.', 'Gemini_Generated_Image_fig1ivfig1ivfig1.jpg'],
  ['bus', 'Describe the bus interior. Explain where the passengers are, what they are doing, and what the display says.', 'bus_interior_isometric_grayscale.png'],
  ['museum', 'Describe the museum scene. Talk about the artworks, the visitors, the guide, and the security guards.', 'museum_isometric_grayscale.png'],
  ['hospital', 'Describe the hospital waiting area. Mention the reception desk, the patients, the signs, and the activities you can see.', 'Gemini_Generated_Image_p7a0lzp7a0lzp7a0.jpg'],
  ['library', 'Describe the library. Include the students, the bookshelves, the desks, and the quiet study atmosphere.', 'library_isometric_grayscale.png'],
  ['beach', 'Describe the beach. Mention the people, the lifeguard station, the boats, the umbrellas, and the children.', 'Gemini_Generated_Image_yf6s8uyf6s8uyf6s.jpg'],
  ['concert', 'Describe the concert. Talk about the performers, the instruments, the lights, and the audience.', 'concert_isometric_grayscale.png'],
  ['restaurant', 'Describe the restaurant. Mention the chefs, the open kitchen, the customers, and the food being served.', 'Gemini_Generated_Image_tqnf8ktqnf8ktqnf.jpg'],
  ['classroom', 'Describe the classroom. Include the teacher, the students, the maps, the timetable, and the learning activities.', 'Gemini_Generated_Image_l2g8y5l2g8y5l2g8.jpg'],
  ['airport', 'Describe the airport security area. Mention the passengers, the conveyor belts, the scanners, and the departures board.', 'Gemini_Generated_Image_g7g7png7g7png7g7.jpg'],
  ['gym', 'Describe the gym. Talk about the equipment, the people exercising, the trainer, and the information on the walls.', 'Gemini_Generated_Image_gtsrqmgtsrqmgtsr.jpg'],
  ['office', 'Describe the office. Mention the employees, the desks, the computers, the meeting area, and the signs.', 'Gemini_Generated_Image_6zr2uy6zr2uy6zr2.jpg'],
  ['park', 'Describe the park. Include the football field, the runners, the families, the benches, and the trees.', 'Gemini_Generated_Image_2n3tbd2n3tbd2n3t.jpg'],
  ['supermarket', 'Describe the supermarket. Mention the shoppers, the aisles, the shopping carts, and the food counter.', 'Gemini_Generated_Image_hf2ykqhf2ykqhf2y.jpg'],
  ['bus-assistance', 'Describe the bus entrance. Explain what the people are doing and how one passenger is being helped.', 'Gemini_Generated_Image_ (1).png'],
];

// 29 topic-matched Q1 images from Practice Studio/incoming/speaking/Describe the Image Exercises
// Each maps to met_speaking_29_prompts.json setId/topic → wired as Q1 with image for Practice Studio
const topicPrompts = [
  ['shopping-01', 'Describe the shopping scene. Mention the store, the shoppers, the products on the shelves, and what people are doing.', 'Gemini_Generated_Image_hf2ykqhf2ykqhf2y.jpg'],
  ['parks-02', 'Describe the park. Mention the green space, the people, the benches, the trees, and the activities you can see.', 'Gemini_Generated_Image_2n3tbd2n3tbd2n3t.jpg'],
  ['work-03', 'Describe the workplace. Mention the desks, the computers, the employees, and the office atmosphere.', 'Gemini_Generated_Image_6zr2uy6zr2uy6zr2.jpg'],
  ['food-04', 'Describe the restaurant. Mention the chefs, the open kitchen, the customers, and the food being served.', 'Gemini_Generated_Image_tqnf8ktqnf8ktqnf.jpg'],
  ['travel-05', 'Describe the airport check-in area. Mention the passengers, the counters, the luggage, and the departure information.', 'speaking_picture_02_airport_check_in.png'],
  ['education-06', 'Describe the classroom. Include the teacher, the students, the boards, and the learning activities.', 'Gemini_Generated_Image_l2g8y5l2g8y5l2g8.jpg'],
  ['health-fitness-07', 'Describe the gym. Talk about the equipment, the people exercising, the trainer, and the layout of the space.', 'Gemini_Generated_Image_gtsrqmgtsrqmgtsr.jpg'],
  ['music-08', 'Describe the concert. Talk about the performers, the instruments, the stage lights, and the audience.', 'concert_isometric_grayscale.png'],
  ['vacation-09', 'Describe the ski resort. Mention the snow, the skiers, the slopes, and the mountain setting.', 'speaking_picture_01_ski_resort.png'],
  ['library-10', 'Describe the library. Include the students, the bookshelves, the desks, and the quiet study atmosphere.', 'library_isometric_grayscale.png'],
  ['healthcare-11', 'Describe the hospital waiting area. Mention the reception desk, the patients, the signs, and the activities.', 'Gemini_Generated_Image_p7a0lzp7a0lzp7a0.jpg'],
  ['museums-12', 'Describe the museum scene. Talk about the artworks, the visitors, the guide, and the layout of the room.', 'museum_isometric_grayscale.png'],
  ['transportation-13', 'Describe the bus interior. Explain where the passengers are, what they are doing, and what the display says.', 'bus_interior_isometric_grayscale.png'],
  ['family-14', 'Describe the café with friends. Mention the people, their activities, the tables, and the atmosphere.', 'cafe_friends_talking_4x3.png'],
  ['sports-15', 'Describe the sporting event. Mention the stadium, the players, the spectators, and the action on the field.', 'MET_Sporting_Event_01_Soccer_4x3.jpg'],
  ['cafes-16', 'Describe the city café. Mention the customers, the tables, the drinks, and the street outside.', 'speaking_picture_04_city_cafe.png'],
  ['technology-17', 'Describe the technology workspace. Mention the computers, the people, the desks, and the digital tools in use.', 'file_00000000cfa4820ebeca4dc59ad0bb5d.png'],
  ['pets-18', 'Describe the scene with animals. Mention the pets, the owners, the setting, and the activities.', 'file_0000000069c4820eb02f89bee94d7e66.png'],
  ['weather-19', 'Describe the beach cleanup. Mention the people, the sand, the ocean, and what everyone is doing.', 'speaking_picture_03_beach_cleanup.png'],
  ['community-20', 'Describe the community gathering. Mention the people, the public space, and the activities taking place.', 'file_00000000bce4820e9250244b256b6b06.png'],
  ['environment-21', 'Describe the environmental scene. Mention the natural area, the people, and what they are doing to help.', '1788761473299.png'],
  ['books-22', 'Describe the reading area. Mention the books, the readers, the furniture, and the quiet atmosphere.', 'file_00000000d19c820e899bdd35b7d1f2c3.png'],
  ['jobs-23', 'Describe the job interview scene. Mention the people, the office setting, the documents, and the interaction.', 'file_000000007e98820e9eb1aa0eb0926005.png'],
  ['online-learning-24', 'Describe the study group with laptops. Mention the students, the screens, the collaboration, and the setting.', 'cafe_laptop_meeting_friend_4x3.png'],
  ['housing-25', 'Describe the housing area. Mention the buildings, the streets, the residents, and the surroundings.', 'file_00000000f600820ea35285ae23355e3e.png'],
  ['science-26', 'Describe the science lab. Mention the equipment, the students, the experiment, and the classroom setup.', 'file_00000000e160820eb996410aa0a8908f.png'],
  ['movies-27', 'Describe the cinema scene. Mention the screen, the audience, the seating, and the atmosphere.', 'file_00000000b054820eab61acbf49c3dfd4.png'],
  ['public-safety-28', 'Describe the road race event. Mention the runners, the street, the spectators, and the safety measures.', 'MET_Sporting_Event_03_Road_Race_4x3-1.jpg'],
  ['social-media-29', 'Describe the group studying together. Mention the people, the devices, the interaction, and the café setting.', 'cafe_group_studying_4x3.png'],
];

const baseExercises = prompts.map(([id, prompt, filename], index) => ({
  id: `image_description_${String(index + 1).padStart(2, '0')}`,
  type: 'speak',
  topic: 'Describe the Image',
  level: 'B1-B2',
  prompt,
  instruction: 'Use the 15-second preparation timer to study the image. Then describe it for 60 seconds. Use the present continuous and location phrases such as in the foreground, on the left, and in the background.',
  preparationSeconds: 15,
  seconds: 60,
  imageUrl: `${IMAGE_DIR}/${encodeURIComponent(filename).replace(/%2F/g, '/')}`,
  imageAlt: `Practice image: ${id}`,
  // Keep this aligned with the five MET Speaking questions. The image is
  // required for Question 1, so this bank is intentionally the only Q1 set.
  metTaskType: 'Q1',
  sampleAnswer: index === 0 ? `This image depicts a busy football stadium during a match, and it looks quite exciting. In the foreground, a goalkeeper dressed in green is jumping to the left to try to save the ball, while two players — one in a white shirt and another in red — are running close behind him. The player in white has probably just kicked the ball, but it is not completely clear from this angle. On the right side of the picture, there is a camera operator who is recording the game, which suggests that it is an important event, perhaps being shown on television. In the background, I can see hundreds of spectators sitting in the stands; some are standing and cheering. The sky looks a little cloudy, but the atmosphere still feels energetic and competitive. If I had to describe the overall mood, I would say it is tense because a goal is about to happen.` : undefined,
}));

const topicExercises = topicPrompts.map(([id, prompt, filename], index) => ({
  id: `image_description_topic_${String(index + 1).padStart(2, '0')}_${id}`,
  type: 'speak',
  topic: 'Describe the Image',
  level: 'B1-B2',
  prompt,
  instruction: 'Use the 15-second preparation timer to study the image. Then describe it for 60 seconds. Use the present continuous and location phrases such as in the foreground, on the left, and in the background.',
  preparationSeconds: 15,
  seconds: 60,
  imageUrl: `${IMAGE_DIR}/${encodeURIComponent(filename).replace(/%2F/g, '/')}`,
  imageAlt: `Practice image: ${id}`,
  metTaskType: 'Q1',
  sourceTopic: id,
}));

export const IMAGE_DESCRIPTION_EXERCISES = [...baseExercises, ...topicExercises];

// ── B2 task-completion base — Q1 Describe the Picture ──
// MET scale: illustrative base for Task Completion (~3), not strict 3/3/3 gold.
// Shows sufficient coverage for 60s (all main elements + general detail, ~145 words, ~145 wpm).
// Use as "help scoring" to judge quantity/coverage vs short/partial responses.
// Language/delivery still scored independently — do not require this exact wording.
export const B2_EXEMPLAR_STADIUM = {
  id: 'b2_exemplar_stadium',
  level: 'B2',
  prompt: prompts[0][1],
  imageUrl: `${IMAGE_DIR}/${encodeURIComponent(prompts[0][2]).replace(/%2F/g, '/')}`,
  // Audio-rendered via /api/tts (ElevenLabs/Deepgram) or local Piper — placeholder MP3 copied from speaking_prompt02.mp3; regenerate with: POST /api/tts { text: transcript }
  audioSrc: '/audio/speaking/b2-exemplar-stadium.mp3',
  audioTranscript: `This image depicts a busy football stadium during a match, and it looks quite exciting. In the foreground, a goalkeeper dressed in green is jumping to the left to try to save the ball, while two players — one in a white shirt and another in red — are running close behind him. The player in white has probably just kicked the ball, but it is not completely clear from this angle. On the right side of the picture, there is a camera operator who is recording the game, which suggests that it is an important event, perhaps being shown on television. In the background, I can see hundreds of spectators sitting in the stands; some are standing and cheering. The sky looks a little cloudy, but the atmosphere still feels energetic and competitive. If I had to describe the overall mood, I would say it is tense because a goal is about to happen.`,
  transcript: `This image depicts a busy football stadium during a match, and it looks quite exciting. In the foreground, a goalkeeper dressed in green is jumping to the left to try to save the ball, while two players — one in a white shirt and another in red — are running close behind him. The player in white has probably just kicked the ball, but it is not completely clear from this angle. On the right side of the picture, there is a camera operator who is recording the game, which suggests that it is an important event, perhaps being shown on television. In the background, I can see hundreds of spectators sitting in the stands; some are standing and cheering. The sky looks a little cloudy, but the atmosphere still feels energetic and competitive. If I had to describe the overall mood, I would say it is tense because a goal is about to happen.`,
  wordCount: 145,
  durationSeconds: 60,
  expectedScores: { task: 3, language: 3, delivery: 3, rubricAvg: 3.0, scaledScore: 60, cefr: 'B2' },
  rationale: {
    task: 'Directly relevant and completes the task with general details (setting, goalkeeper, players, camera operator, spectators) but without extensive or original elaboration — matches 3.0.',
    language: 'Some complex structures ("which suggests that it is", "although/if I had to") without consistent control; vocabulary directly appropriate; minor imprecision ("probably") does not block meaning — matches 3.0.',
    delivery: 'Assumes some hesitation and reformulation but no long pauses; generally clear and easy to follow — matches 3.0 when spoken at natural pace.',
  },
  whyNotHigher: 'Not 3.5–4: lacks consistently controlled complex sentences and extensive original detail; vocabulary is appropriate but not broad or precise throughout.',
  whyNotLower: 'Not 2.5: covers all main elements, quantity is sufficient for 60s, and complex forms are attempted without breakdown.',
};

export default IMAGE_DESCRIPTION_EXERCISES;
