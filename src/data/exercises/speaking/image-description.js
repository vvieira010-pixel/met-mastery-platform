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

export const IMAGE_DESCRIPTION_EXERCISES = prompts.map(([id, prompt, filename], index) => ({
  id: `image_description_${String(index + 1).padStart(2, '0')}`,
  type: 'speak',
  topic: 'Describe the Image',
  level: 'B1-B2',
  prompt,
  instruction: 'Look at the image, plan for a few seconds, then describe it for 30–45 seconds. Use the present continuous and location phrases such as in the foreground, on the left, and in the background.',
  imageUrl: `${IMAGE_DIR}/${encodeURIComponent(filename).replace(/%2F/g, '/')}`,
  imageAlt: `Practice image: ${id}`,
  metTaskType: 'picture_description',
}));

export default IMAGE_DESCRIPTION_EXERCISES;
