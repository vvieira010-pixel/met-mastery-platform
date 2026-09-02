import fs from 'fs';
import path from 'path';

function q(n, qtype, question, a,b,c,d, correct, expl){
  return {number:n, type:qtype, question, options:{A:a,B:b,C:c,D:d}, correct, explanation:expl};
}
const passages = [];
function single(pid, topic, intro, text, qs){
  passages.push({passageId:pid, kind:"single", topic, intro, text, questions:qs});
}

// Replicate Python passages 1-14 as JS strings (using template literals)
single(1, "World's Fairs", "This passage is about world's fairs.",
`Elevators, telephones, televisions—crowds marveled at these scientific wonders when they were introduced. These inventions may now be used by millions of people on a daily basis, but once they were found exclusively at world's fairs.

Early world's fairs in the 1800s captivated audiences, exposing them to the latest ideas within distinctive and impressive structures. Significant examples are London's Great Exhibition of 1851, housed within a "Crystal Palace," a massive temporary glass building supported by a cast iron frame, and Chicago's World's Columbian Exposition of 1893 with its over two-hundred buildings and structures erected specifically for the fair in neoclassical architectural style, including fountains reminiscent of those in Rome. These fairs served as educational forums, gathering people from around the globe to share new developments and witness progress.

In the 1900s, with New York's 1939–1940 fair themed "Building the World of Tomorrow," world's fairs took on a new role—that of addressing global issues. While technological advances remained an important feature of those events, audiences began to see world's fairs as a means to support cross-cultural dialogue and the exchange of possible solutions to social and political conflict. In harmony with this purpose, the highly successful Expo 67, held in Montreal, Canada, featured the United Nations—an international organization whose stated mission is to achieve world peace—alongside the dozens of countries participating in the exhibition.

Today, many people communicate their opinions over the Internet, and this virtual world has largely reduced the need to meet as a group within one physical space. It has not, however, diminished the visceral desire to see the future with our own eyes and touch it with our hands, nor has it suppressed that social compulsion to exhibit our achievements. Thus, at Expo 2010 in Shanghai, China, people gathered once again to witness the unveiling of awe-inspiring machines. Perhaps one day they will become familiar to all of us.`,[
q(1,"main idea","What is the passage mainly about?","the history and changing purposes of world's fairs","how inventions are tested at international exhibitions","the architecture of famous exhibition buildings","the role of the Internet in modern society","A","The passage traces fairs from the 1800s (displaying inventions) to the 1900s (addressing global issues) to today (still showcasing the future)."),
q(2,"detail","According to the passage, what was the main purpose of early world's fairs?","to sell products to the public","to display technological advances","to promote political agreements","to raise money for scientists","B","Paragraph 2 says early fairs exposed audiences to 'the latest ideas' and served as 'educational forums'"),
q(3,"vocabulary","In the second sentence of paragraph 2, what does the phrase 'reminiscent of' mean?","similar to","located near","designed by","famous in","A","Reminiscent means similar to."),
q(4,"purpose","Why does the author mention Expo 67 in Montreal?","to show that fairs began to focus on global issues","to explain why the United Nations was created","to compare Canadian and American fairs","to describe the most successful fair ever held","A","Expo 67 illustrates the shift to addressing global issues."),
q(5,"inference","What does the author suggest about future world's fairs?","They will probably disappear because of the Internet.","They will continue to attract people who want to see new inventions.","They will focus only on entertainment, not technology.","They will be held exclusively online.","B","Internet hasn't removed desire to see future with own eyes."),
]);

single(2, "Jupiter's Great Red Spot", "This passage is about Jupiter's Great Red Spot.",
`The Great Red Spot is a massive storm that has been active on Jupiter for centuries. About 20,000 kilometers in length and 12,000 kilometers wide, the Great Red Spot has captured the attention of scientists and amateur astronomers alike. Its name is derived from the distinct red color associated with the area, although it appears much paler in places, with colors ranging from dark red and pinkish tones to almost white. Similar to hurricanes on Earth, the storm's strong winds blow in a circular motion. However, unlike hurricanes, which form around low-pressure areas, the Great Red Spot has a high-pressure system. Due to its location in Jupiter's southern hemisphere, its winds blow in a counter-clockwise direction and can reach up to 644 kilometers per hour—almost twice as strong as the top hurricane winds recorded on Earth.

The Great Red Spot remains a source of mystery and fascination. No one knows for sure what causes the storm's reddish color. One theory suggests the strong winds kick up material buried deeper in the atmosphere, and exposure to sunlight causes that material to take on the characteristic red tones. Reasons behind the storm's lengthy duration are also unclear. Some scientists think the Great Red Spot is constantly fed by smaller storms, allowing it to continue endlessly, while others believe it may be fueled by small drops of water or ammonia from below.

Scientists have noted that the Great Red Spot's shape has evolved over time. Once long and thin like a sausage, it is now more of an oval shape, and scientists believe it may become circular within a few decades. The storm also appears to be slowly shrinking. As a result, researchers concede the possibility that someday the Great Red Spot could disappear entirely. However, the likelihood seems remote as it is still the largest and most powerful storm on the planet—two to three times the size of the Earth.`,[
q(6,"main idea","What is the passage mainly about?","the characteristics of Jupiter's largest storm","how hurricanes form on Earth and Jupiter","the history of astronomical discoveries","different types of storms on Jupiter","A",""),
q(7,"detail","According to the passage, how is the Great Red Spot different from hurricanes on Earth?","It has a high-pressure system.","It blows in a circular motion.","It forms in the southern hemisphere.","It has very strong winds.","A",""),
q(8,"vocabulary","In the fourth sentence of paragraph 3, which word is closest in meaning to 'concede'?","admit","prove","wonder","announce","A",""),
q(9,"purpose","Why does the author mention the storm's changing shape?","to show that the storm is becoming weaker","to illustrate that the storm is still changing over time","to explain why the storm is red","to compare Jupiter to Earth","B",""),
q(10,"inference","What is the author's opinion about the future of the Great Red Spot?","It will probably remain active.","It will most likely disappear soon.","Its color will become darker.","It will grow larger than Earth.","A",""),
]);

single(3, "Music and Learning", "This passage is about music and education.",
`Psychologists have known for a long time that music affects people's feelings. James Kellaris, a psychology professor, has studied ways that music affects shopping. He says that playing the right kind of music can have positive effects for a business.

Kellaris has identified several effects that might help businesses decide what kind of background music to play as their customers shop. Kellaris found that fast music makes a crowded store feel more crowded, and slow music makes an empty store feel lonely. Also, music with a faster tempo makes the time that customers are in the store seem shorter. This might help store owners because the more time customers are in a store, the more likely they are to buy something. A related effect happens when background music is played to customers "on hold" on telephone lines. If people hear fast music, they think their wait time is shorter than if they listen to slower music.

Kellaris also investigated what styles of music customers prefer while they are shopping or on hold, and he found there are differences between men and women. Women had the highest positive reactions to jazz, followed by classical, while men most preferred classical, followed by jazz. Rock music was least preferred by both groups. Many store owners say they pay close attention to their customers and choose their music accordingly.`,[
q(11,"main idea","What is the passage mainly about?","how businesses can use music to influence customers","why men and women prefer different types of music","the history of psychological research on music","how music affects people's emotions at home","A",""),
q(12,"detail","According to the passage, what effect does fast music have on customers in a store?","It makes them buy more products.","It makes them feel the store is less crowded.","It makes them think they have spent less time there.","It makes them prefer jazz over classical music.","C",""),
q(13,"vocabulary","In the second sentence of paragraph 2, which word is closest in meaning to 'identified'?","recognized","created","ignored","copied","A",""),
q(14,"purpose","Why does the author mention customers 'on hold'?","to show that music affects people in different situations","to explain why telephone companies use music","to compare shopping and waiting experiences","to describe a new type of background music","A",""),
q(15,"inference","What do store owners do with Kellaris's findings?","They ignore them because they are too complicated.","They use them to choose music for their stores.","They share them with their competitors.","They test them in their own research labs.","B",""),
]);

single(4, "Grandville Music Center", "This passage is about a music school.",
`Guitar Lessons
Study rock, blues, or classical guitar.
Our teachers are experts who make learning fun while challenging you to develop and grow as a musician.
Your teacher will design a lesson plan with you based on your goals and interests.
Beginner, intermediate, and advanced level instruction is available.
Recitals are held in the spring and are a great opportunity for students to play in front of an audience. Participation is optional but is highly recommended.
We will schedule your introductory lesson with a teacher who matches your interests and needs!
Visit the Center today to sign up!


Did you know?
Research studies have shown that music has a positive effect on children's academic performance. One study found that high school students who played musical instruments scored higher on a test than their peers who did not participate in band.
Other researchers have noted that young children who studied music have an easier time understanding some mathematical ideas. In one study, second grade students who were given four months of piano lessons did better on a fractions test than the students who did not study piano. This could be because their musical instruction taught them the relationship between eighth, quarter, half, and whole notes, and they were able to transfer that understanding to the use of fractions in other situations.
Studies such as these surely prove that musical education should be provided in all schools, despite the cost of hiring teachers and buying instruments.`,[
q(16,"detail (section A)","The following question refers to section A. What can be inferred about the guitar teachers?","They can play other instruments.","They have teaching experience.","They prefer to teach beginners.","They use the same lesson plans for all students.","B",""),
q(17,"detail (section A)","The following question refers to section A. What should someone do who wants to take guitar lessons?","send in a registration form","prepare a lesson plan","visit the Grandville Music Center","email the director","C",""),
q(18,"detail (section B)","The following question refers to section B. Why did piano students do well on a fractions test?","They listened to music while they studied.","The test used fractions in musical situations.","They had studied the concept of fractions in music.","They were also enrolled in a special math class.","C",""),
q(19,"purpose (section B)","The following question refers to section B. How does the author feel about musical education?","It is too expensive for schools.","It is an area that should be researched further.","It is most important for young children.","It should be offered in all schools.","D",""),
q(20,"detail (section B)","The following question refers to section B. According to the passage, what is the main benefit of music for children?","It helps them learn mathematical ideas.","It makes them better at sports.","It improves their memory for names.","It teaches them to play in a band.","A",""),
]);

single(5, "The History of Chocolate", "This passage is about chocolate.",
`Chocolate begins its story in the rainforests of Central and South America, where the cacao tree grows. The ancient Maya and Aztec peoples were the first to cultivate cacao, and they used its seeds to make a bitter, frothy drink that was reserved for ceremonies and for the elite. The word 'chocolate' may come from the Aztec word xocolātl, meaning 'bitter water.'

When Spanish explorers arrived in the Americas in the 1500s, they brought cacao back to Europe. At first, chocolate remained a luxury item, consumed mainly by the wealthy. However, as trade routes expanded and production methods improved, chocolate became more widely available. In the 1800s, the invention of solid chocolate bars and milk chocolate transformed it from a drink into a treat that could be carried and shared.

Today, chocolate is one of the world's most popular foods, but its production raises serious ethical questions. Most cacao is grown by small farmers in West Africa, many of whom earn very low incomes. In some regions, child labor has been documented on cacao farms, prompting international organizations to demand change. Several companies now label their products 'fair trade,' indicating that farmers received a higher price for their cacao.

Despite these efforts, activists argue that more must be done to ensure that the people who grow cacao can afford to send their own children to school and live with dignity. For consumers, the challenge is to enjoy chocolate while also supporting practices that protect the rights of farmers and workers.`,[
q(21,"main idea","What is the passage mainly about?","the history and ethical issues surrounding chocolate","how chocolate is made from cacao beans","the difference between Maya and Aztec cultures","why chocolate is so popular around the world","A",""),
q(22,"detail","According to the passage, how was chocolate originally used?","as a sweet candy for children","as a bitter drink for ceremonies and the elite","as a medicine for common people","as a form of money in trade","B",""),
q(23,"vocabulary","In the third sentence of paragraph 2, which word is closest in meaning to 'transformed'?","changed","hidden","destroyed","copied","A",""),
q(24,"purpose","Why does the author mention 'fair trade' labels?","to show that chocolate is becoming more expensive","to describe one attempt to improve farmers' incomes","to explain how chocolate is advertised","to compare different brands of chocolate","B",""),
q(25,"inference","What does the author suggest consumers should do?","stop eating chocolate entirely","buy only the cheapest chocolate available","choose chocolate that supports fair practices","demand that all chocolate be made in Europe","C",""),
]);

single(6, "The Printing Press", "This passage is about the printing press.",
`Before the 1400s, books in Europe were copied by hand, usually by monks working in monasteries. This process was slow and expensive, so books were rare and most people could not read. In 1455, a German goldsmith named Johannes Gutenberg changed history by introducing movable type to Europe. His printing press allowed pages to be produced quickly and in large numbers.

The effects were immediate and far-reaching. Within fifty years, printing presses had been established in cities across Europe, and the number of books in circulation increased dramatically. As books became cheaper and more common, literacy rates rose. People could now read the Bible, scientific works, and political pamphlets for themselves, rather than relying on priests or rulers to interpret information for them.

Historians argue that the printing press helped bring about the Renaissance, the Reformation, and the Scientific Revolution. By spreading new ideas rapidly, it weakened the authority of traditional institutions and encouraged individuals to think for themselves. Some scholars even call it the most important invention of the second millennium.

Today, the internet plays a role similar to that of the printing press. It allows information to be shared instantly across the globe, and like the press, it has raised questions about who controls knowledge and how truth can be distinguished from falsehood. Yet the basic principle remains the same: when information becomes widely accessible, societies change.`,[
q(26,"main idea","What is the passage mainly about?","the life of Johannes Gutenberg","how the printing press changed society","why books were expensive before 1455","the differences between the internet and the printing press","B",""),
q(27,"detail","According to the passage, what was one result of the printing press?","Monks stopped copying books entirely.","Books became cheaper and more common.","People stopped going to church.","European cities became smaller.","B",""),
q(28,"vocabulary","In the second sentence of paragraph 3, which word is closest in meaning to 'weakened'?","reduced the power of","increased the cost of","improved the quality of","protected the interests of","A",""),
q(29,"purpose","Why does the author mention the internet?","to show that the printing press is no longer important","to compare two technologies that spread information widely","to explain how to use the internet safely","to argue that books are better than websites","B",""),
q(30,"inference","What does the author believe about accessible information?","It always leads to positive changes.","It makes societies more difficult to govern.","It tends to bring about social change.","It should be controlled by governments.","C",""),
]);

single(7, "The Water Cycle", "This passage is about the water cycle.",
`Water is constantly moving between the Earth's surface and the atmosphere in a process known as the water cycle. The sun heats water in oceans, lakes, and rivers, causing it to evaporate and rise into the air as water vapor. As the vapor rises, it cools and condenses into tiny droplets, forming clouds. When the droplets become heavy enough, they fall back to Earth as precipitation—rain, snow, sleet, or hail.

Once water reaches the ground, it follows several paths. Some of it flows over the surface into streams and rivers, eventually returning to the ocean. Some soaks into the soil and is taken up by plant roots, later released back into the air through transpiration. The rest sinks deeper, becoming groundwater that may remain underground for hundreds or even thousands of years before resurfacing.

The water cycle is essential for life. It distributes fresh water across the planet, supports agriculture, and helps regulate the Earth's temperature. However, human activities are affecting the cycle in dangerous ways. Deforestation reduces transpiration, and climate change is altering precipitation patterns, leading to more severe droughts and floods in different regions.

Scientists warn that protecting the water cycle requires reducing greenhouse gas emissions and preserving forests. They also emphasize that individuals can help by conserving water at home and supporting policies that protect watersheds. Though the cycle itself will continue, the quality and availability of water for human use depend on the choices people make today.`,[
q(31,"main idea","What is the passage mainly about?","how the water cycle works and why it matters","the different types of precipitation","why climate change causes droughts","how to conserve water at home","A",""),
q(32,"detail","According to the passage, what happens when water vapor cools?","It evaporates into the atmosphere.","It condenses into droplets and forms clouds.","It soaks into the soil as groundwater.","It flows directly into the ocean.","B",""),
q(33,"vocabulary","In the second sentence of paragraph 3, which word is closest in meaning to 'distributes'?","spreads","stores","purifies","measures","A",""),
q(34,"purpose","Why does the author mention deforestation?","to explain why forests are cut down","to give an example of how humans affect the water cycle","to describe the benefits of planting trees","to compare forests and oceans","B",""),
q(35,"inference","What does the author suggest about the future of the water cycle?","It will stop if people do not conserve water.","It will continue, but water quality may suffer.","It will become faster as the Earth warms.","It will provide more water than in the past.","B",""),
]);

single(8, "Marie Curie", "This passage is about Marie Curie.",
`Marie Curie was born in Warsaw, Poland, in 1867, at a time when women were rarely allowed to attend university. Determined to continue her education, she moved to Paris in 1891 and enrolled at the Sorbonne, where she studied physics and mathematics. Despite financial difficulties and the challenges of being a woman in a male-dominated field, she graduated at the top of her class.

In 1895, she married Pierre Curie, a French physicist, and together they began researching radioactivity—a term Marie herself coined. Working in a poorly equipped laboratory, the Curies discovered two new elements: polonium, named after Marie's homeland, and radium. In 1903, Marie became the first woman to win a Nobel Prize, sharing the award in physics with Pierre and another scientist.

Tragedy struck in 1906 when Pierre was killed in a street accident. Marie took over his teaching position at the Sorbonne, becoming the institution's first female professor. She continued her research and, in 1911, won a second Nobel Prize, this time in chemistry, for isolating pure radium. She remains the only person to have won Nobel Prizes in two different scientific fields.

During World War I, Curie developed mobile X-ray units that allowed doctors to examine wounded soldiers near the battlefield. She often operated these units herself, despite the health risks of prolonged exposure to radiation. She died in 1934, likely from complications related to her lifelong work with radioactive materials. Today, her legacy endures not only in science but also as a symbol of perseverance and intellectual courage.`,[
q(36,"main idea","What is the passage mainly about?","the discoveries of radium and polonium","the life and achievements of Marie Curie","how women gained access to universities","the dangers of working with radiation","B",""),
q(37,"detail","According to the passage, why did Marie Curie move to Paris?","to escape a war in Poland","to attend university","to work with Pierre Curie","to win a Nobel Prize","B",""),
q(38,"vocabulary","In the second sentence of paragraph 2, which word is closest in meaning to 'coined'?","invented","borrowed","translated","criticized","A",""),
q(39,"purpose","Why does the author mention the mobile X-ray units?","to show how Curie applied science to help others","to explain how X-rays were discovered","to describe the technology of World War I","to compare war medicine and peacetime medicine","A",""),
q(40,"inference","What does the author suggest about Curie's death?","It was caused by an accident in the laboratory.","It was related to her work with radioactive materials.","It was the result of a street accident like Pierre's.","It was due to old age and natural causes.","B",""),
]);

single(9, "The Great Barrier Reef", "This passage is about the Great Barrier Reef.",
`Stretching more than 2,300 kilometers along the northeast coast of Australia, the Great Barrier Reef is the world's largest coral reef system. It is composed of nearly 3,000 individual reefs and 900 islands, making it visible from space. The reef supports an extraordinary diversity of life, including more than 1,500 species of fish, 400 types of coral, and thousands of species of mollusks, sponges, and other marine creatures.

Coral reefs are built by tiny animals called polyps, which secrete a hard skeleton of calcium carbonate. Over thousands of years, these skeletons accumulate to form the massive structures we see today. The relationship between coral and microscopic algae called zooxanthellae is essential: the algae live inside the coral and provide it with food through photosynthesis, while the coral offers the algae protection and access to sunlight.

In recent decades, the reef has faced serious threats. Rising ocean temperatures cause coral bleaching, a process in which stressed corals expel their algae and turn white. Without the algae, the corals lose their main source of energy and may die. Pollution from agricultural runoff and coastal development has also damaged large sections of the reef.

Scientists and conservationists are working to protect the reef through measures such as reducing carbon emissions, improving water quality, and establishing marine protected areas. However, they warn that the reef's long-term survival depends on global action to limit climate change. Without significant reductions in greenhouse gases, even local efforts may not be enough to save this natural wonder.`,[
q(41,"main idea","What is the passage mainly about?","how coral polyps build reefs","the features and threats to the Great Barrier Reef","the tourism industry in Australia","the differences between fish and coral species","B",""),
q(42,"detail","According to the passage, what role do zooxanthellae play?","They build the coral's calcium carbonate skeleton.","They provide food to the coral through photosynthesis.","They protect the coral from pollution.","They attract fish to the reef.","B",""),
q(43,"vocabulary","In the third sentence of paragraph 3, which word is closest in meaning to 'expel'?","absorb","release","consume","attract","B",""),
q(44,"purpose","Why does the author mention agricultural runoff?","to explain how fish are farmed near the reef","to give an example of pollution damaging the reef","to describe the main source of food for coral","to compare farming and tourism","B",""),
q(45,"inference","What do scientists believe is necessary to save the reef?","local efforts alone will be sufficient","global action to reduce climate change","stopping all tourism near the reef","moving the coral to cooler waters","B",""),
]);

single(10, "The Silk Road", "This passage is about the Silk Road.",
`The Silk Road was not a single road but a network of trade routes that connected China to the Mediterranean Sea for more than 1,500 years. Beginning around the second century B.C.E., merchants traveled these routes carrying silk, spices, precious metals, and other goods. Along with products, ideas, technologies, and religions also spread across continents.

The journey was long and dangerous. Traders faced harsh deserts, high mountains, and the threat of bandits. To reduce risks, merchants often traveled in large caravans, stopping at oasis towns to rest and exchange goods. These towns grew wealthy as trading centers, and some, such as Samarkand and Bukhara, became famous for their architecture and learning.

The Silk Road also facilitated cultural exchange. Buddhism traveled from India to China along these routes, and later, Islam spread into Central Asia. Papermaking, gunpowder, and the compass moved from China to the West, while glassmaking and certain artistic styles traveled eastward. Historians argue that the Silk Road helped shape the civilizations of Europe, Asia, and Africa.

By the 1400s, the Silk Road began to decline as sea routes became safer and faster. European explorers sought direct access to Asian markets by sailing around Africa and across the Atlantic. Although the overland routes lost their importance, the legacy of the Silk Road endures in the languages, religions, and technologies that were shared along the way.`,[
q(46,"main idea","What is the passage mainly about?","the dangers of traveling in ancient deserts","the history and impact of the Silk Road","how silk was produced in ancient China","the architecture of Samarkand and Bukhara","B",""),
q(47,"detail","According to the passage, what did merchants do to reduce risks on the Silk Road?","They hired soldiers to protect them.","They traveled in large caravans.","They avoided oasis towns.","They sailed instead of walking.","B",""),
q(48,"vocabulary","In the first sentence of paragraph 3, which word is closest in meaning to 'facilitated'?","prevented","enabled","delayed","ignored","B",""),
q(49,"purpose","Why does the author mention Buddhism and Islam?","to show that religion was more important than trade","to illustrate how ideas spread along the routes","to explain why the routes declined","to compare different religions","B",""),
q(50,"inference","What does the author suggest about the Silk Road's legacy?","It disappeared completely after the 1400s.","It can still be seen in cultures today.","It was less important than sea routes.","It only affected China and Europe.","B",""),
]);

single(11, "The Human Brain", "This passage is about the human brain.",
`The human brain is the most complex organ in the body, containing roughly 86 billion neurons. Each neuron can form connections with thousands of others, creating a network far more intricate than any computer ever built. This network allows us to think, remember, feel emotions, and control our movements.

Different parts of the brain specialize in different functions. The cerebrum, the largest part, is responsible for thinking, planning, and voluntary movement. The cerebellum, located at the back, coordinates balance and fine motor skills. Deep inside, structures such as the hippocampus play a key role in forming memories, while the amygdala processes emotions like fear and anger.

Despite its complexity, the brain is remarkably adaptable. When one area is damaged, other regions can sometimes take over its functions—a phenomenon known as neuroplasticity. This ability is strongest in children, which is why young brains can recover from injuries more easily than adult brains. However, neuroplasticity continues throughout life, allowing people to learn new skills and adapt to changing circumstances.

Scientists are still uncovering the brain's secrets. Recent research has shown that the brain continues to produce new neurons in certain areas, even in adulthood. This discovery challenges the old belief that we are born with all the brain cells we will ever have. As imaging technology improves, researchers hope to better understand conditions such as Alzheimer's disease, depression, and schizophrenia, and to develop more effective treatments.`,[
q(51,"main idea","What is the passage mainly about?","how the brain controls movement","the structure and abilities of the human brain","the causes of brain diseases","the differences between children's and adults' brains","B",""),
q(52,"detail","According to the passage, what does the cerebellum do?","It forms memories.","It processes emotions.","It coordinates balance and fine motor skills.","It controls thinking and planning.","C",""),
q(53,"vocabulary","In the third sentence of paragraph 3, which word is closest in meaning to 'phenomenon'?","problem","occurrence","theory","experiment","B",""),
q(54,"purpose","Why does the author mention neuroplasticity?","to show that the brain can change and adapt","to explain why children learn languages faster","to describe a type of brain disease","to compare brains and computers","A",""),
q(55,"inference","What do scientists hope to achieve with better imaging technology?","to grow new neurons in the laboratory","to understand and treat brain disorders","to prove that adults cannot learn new skills","to replace damaged brain parts with computers","B",""),
]);

single(12, "Renewable Energy", "This passage is about renewable energy.",
`As the world's population grows and economies expand, the demand for energy continues to rise. Most of this energy still comes from fossil fuels such as coal, oil, and natural gas. Burning these fuels releases carbon dioxide and other greenhouse gases, which contribute to climate change. For this reason, many countries are investing in renewable energy sources—those that can be replenished naturally and produce little or no pollution.

Solar and wind power are the fastest-growing renewable sources. Solar panels convert sunlight directly into electricity, while wind turbines use the motion of air to generate power. Both technologies have become significantly cheaper in recent years, making them competitive with fossil fuels in many regions. However, they also have limitations: solar panels produce no energy at night, and wind turbines depend on consistent wind patterns.

Hydroelectric power, generated by dams on rivers, currently provides more electricity worldwide than any other renewable source. It is reliable and can be adjusted quickly to meet changing demand. Yet large dams can disrupt ecosystems and displace communities, leading to environmental and social concerns.

Experts agree that no single energy source can meet the world's needs alone. Instead, a mix of renewables—solar, wind, hydro, and others—combined with improvements in energy storage and efficiency, will be necessary to reduce emissions while ensuring a stable power supply. The transition will require significant investment, but the long-term benefits for the climate and public health are expected to outweigh the costs.`,[
q(56,"main idea","What is the passage mainly about?","how fossil fuels are formed","the advantages and challenges of renewable energy","why solar power is better than wind power","the history of hydroelectric dams","B",""),
q(57,"detail","According to the passage, what is a limitation of solar power?","It produces greenhouse gases.","It cannot generate electricity at night.","It is more expensive than fossil fuels.","It requires large dams.","B",""),
q(58,"vocabulary","In the second sentence of paragraph 1, which word is closest in meaning to 'replenished'?","replaced","reduced","measured","stored","A",""),
q(59,"purpose","Why does the author mention large dams?","to recommend building more of them","to show that hydroelectric power has drawbacks","to compare rivers and oceans","to explain how fish migrate","B",""),
q(60,"inference","What do experts believe about the future of energy?","One renewable source will dominate the market.","Fossil fuels will remain the main source forever.","A combination of renewables will be needed.","Energy storage is not important.","C",""),
]);

single(13, "The Olympic Games", "This passage is about the Olympic Games.",
`The Olympic Games began in ancient Greece more than 2,700 years ago as a religious and athletic festival held every four years in Olympia. Only free men who spoke Greek were allowed to compete, and the events included running, wrestling, boxing, and chariot racing. Winners received olive wreaths and were honored as heroes in their home cities.

The ancient Games continued for nearly twelve centuries until they were banned by a Roman emperor in 393 C.E. as part of an effort to suppress pagan traditions. For more than 1,500 years, no Olympic Games were held. In the late 1800s, a French educator named Baron Pierre de Coubertin proposed reviving the Olympics as a way to promote peace and international understanding through sport.

The first modern Olympics took place in Athens in 1896, with 241 athletes from 14 nations. Since then, the Games have grown into a global event, with thousands of competitors from nearly every country. The Olympic symbol of five interlocking rings represents the unity of the five continents, and the motto 'Citius, Altius, Fortius'—'Faster, Higher, Stronger'—expresses the spirit of athletic excellence.

Today, the Olympics face new challenges, including the high cost of hosting the Games and concerns about the environmental impact of building large stadiums. Some critics argue that the money spent on the Olympics could be better used to address social problems. Supporters, however, believe that the Games continue to inspire people around the world and provide a rare opportunity for nations to come together in peaceful competition.`,[
q(61,"main idea","What is the passage mainly about?","the history and significance of the Olympic Games","how to train for Olympic events","the problems with modern stadiums","the life of Baron Pierre de Coubertin","A",""),
q(62,"detail","According to the passage, who could compete in the ancient Olympics?","anyone who lived in Greece","free men who spoke Greek","athletes from all countries","only winners of local contests","B",""),
q(63,"vocabulary","In the second sentence of paragraph 2, which word is closest in meaning to 'suppress'?","encourage","eliminate","celebrate","reform","B",""),
q(64,"purpose","Why does the author mention the five interlocking rings?","to describe the design of Olympic medals","to explain the meaning of the Olympic symbol","to compare ancient and modern symbols","to show how many continents compete","B",""),
q(65,"inference","What does the author suggest about the future of the Olympics?","They will definitely be canceled because of costs.","They will continue despite criticisms and challenges.","They will only be held in wealthy countries.","They will stop including athletic events.","B",""),
]);

const multitext = {
 passageId:14, kind:"multi-text", topic:"A City Tree Program", intro:"This set of texts is about a city tree program. Section A is a public notice. Section B is an information box. Section C is a news article.",
 sections:{
  A: `Riverside Park Tree Adoption Day\nSaturday, May 9, 9:00 a.m. – 1:00 p.m.\n\nHelp us plant 200 native trees along the river! No experience is necessary — our staff will provide tools, gloves, and instruction. Volunteers under 16 must be accompanied by an adult. Lunch will be provided for all registered volunteers. Space is limited to 80 participants, so register online by May 2 at the Parks Department website. Rain date: May 16.`,
  B: `Did you know?\n\nA single mature tree can absorb about 20 kilograms of carbon dioxide per year and release enough oxygen for two people. Trees planted on the west side of a house can reduce summer air-conditioning costs by up to 30 percent. Studies have also shown that shoppers spend more time — and more money — in tree-lined shopping districts, and that houses on streets with trees sell faster and at higher prices than similar houses on treeless streets.`,
  C: `When Riverdale launched its "20,000 Trees" campaign five years ago, skeptics called it a publicity stunt. The city promised to plant 20,000 trees in five years — a number that seemed designed for headlines rather than for reality. This spring, however, the city announced that it had planted its 21,000th tree, exceeding its goal with months to spare.\n\nThe program's success rests on an unusual strategy: rather than doing all the work itself, the city gives trees away. Residents who agree to plant and water a tree in their yard receive one free of charge, along with instructions and a follow-up visit from a city arborist. Schools and businesses can request larger plantings, which the city installs with the help of volunteers. According to program director Ana Costa, the approach works because it spreads responsibility. "A city crew can plant a tree in an hour," she says, "but that tree needs water every week for three years. We can't be everywhere — so we recruit the neighborhood."\n\nNot everyone is convinced. A recent audit found that about 15 percent of the trees planted in the campaign's first two years have died, most of them from lack of water during a drought. City officials acknowledge the losses but note that survival rates have improved since the city began requiring adopters to attend a short training session. "We learned that handing someone a tree is the easy part," Costa admits. "Teaching them to keep it alive is the real program."`
 },
 questions:[
 q(66,"detail (section A)","The following question refers to section A. What must volunteers younger than 16 do?","register before everyone else","bring their own tools and gloves","come with an adult","attend a training session","C",""),
 q(67,"detail (section A)","The following question refers to section A. Why should interested volunteers act before May 2?","The event will be moved to the rain date.","Online registration closes on that date.","Lunch will not be provided after that day.","The park will close for planting.","B",""),
 q(68,"detail (section B)","The following question refers to section B. According to the text, how do trees affect shoppers?","They make shoppers feel younger.","They cause shoppers to spend more time and money in an area.","They encourage shoppers to buy houses nearby.","They help shoppers find stores more easily.","B",""),
 q(69,"detail (section B)","The following question refers to section B. According to the text, where should trees be planted to lower cooling costs?","in shopping districts","in public parks","close to rivers","on the west side of a house","D",""),
 q(70,"detail (section C)","The following question refers to section C. What was the skeptics' original view of the campaign?","It would cost too much money.","It was intended mainly to generate publicity.","It would take longer than five years.","It planted trees in the wrong locations.","B",""),
 q(71,"detail (section C)","The following question refers to section C. How does the city carry out most of its planting?","It hires a professional planting company.","It requires schools to plant trees weekly.","It gives trees to residents who plant and water them.","It pays volunteers by the hour.","C",""),
 q(72,"vocabulary (section C)","The following question refers to section C. In the last sentence of the second paragraph, what does Costa mean by 'recruit the neighborhood'?","hire neighbors as city employees","get local residents to care for the trees","ask neighbors to donate money","move trees into people's yards","B",""),
 q(73,"detail (section C)","The following question refers to section C. According to the audit, why did most of the lost trees die?","They were planted incorrectly by volunteers.","They were not watered during a drought.","They were damaged by construction.","They were attacked by insects.","B",""),
 q(74,"detail (section C)","The following question refers to section C. What change improved tree survival rates?","using more experienced city crews","choosing more drought-resistant species","reducing the number of trees planted each year","requiring adopters to attend a short training session","D",""),
 q(75,"cross-text","The following question refers to sections A and C. What goal do both texts share?","raising money for the parks department","involving community members in planting trees","training professional arborists","celebrating the planting of the 21,000th tree","B",""),
 q(76,"cross-text","The following question refers to sections B and C. How is the information in section B relevant to section C?","It proves that the audit in section C was inaccurate.","It explains the deadline mentioned in section C.","It describes benefits that may motivate residents to accept free trees.","It contradicts the skeptics quoted in section C.","C",""),
 q(77,"cross-text","The following question refers to all three sections. Which statement would program director Ana Costa most likely agree with?","Tree planting should be left to professional city crews.","A campaign succeeds through long-term community care, not just planting.","Publicity is more important than survival rates.","Trees grow best along rivers and in parks.","B",""),
 ]
};
passages.push(multitext);

fs.mkdirSync("output", {recursive:true});
const payload = {
 id:"reading-23", title:"Reading 23 — MET Subjects (MET-Style Reading Practice)", totalQuestions:77, level:"B1–C1 (MET)",
 format:{style:"MET (Michigan English Test) reading", choicesPerQuestion:4, structure:"13 single passages × 5 questions + 1 multi-text set (A/B/C) × 12 questions", questionTypes:["main idea","detail","vocabulary in context","author's purpose","inference","cross-text"]},
 passages: passages.map(p=> {
   const entry = {passageId:p.passageId, kind:p.kind, topic:p.topic, intro:p.intro};
   if(p.kind==="single") entry.text=p.text; else entry.sections=p.sections;
   entry.questions=p.questions;
   return entry;
 })
};
fs.writeFileSync("output/reading_23_met_subjects_77_questions.json", JSON.stringify(payload,null,2));
let md=["# Reading 23 — MET Subjects","","**MET-Style Reading Practice · 77 questions · Level B1–C1**","","Choose the best answer (A, B, C, or D) for each question.",""];
let key=[];
for(const p of passages){
 md.push("---"); md.push(`## Text ${p.passageId} — ${p.topic}`); md.push(`*${p.intro}*`); md.push("");
 if(p.kind==="single") md.push(p.text); else for(const [sec,txt] of Object.entries(p.sections)){ md.push(`### Section ${sec}`); md.push(txt); md.push(""); }
 md.push("");
 for(const qq of p.questions){ md.push(`**${qq.number}.** ${qq.question}`); for(const L of ["A","B","C","D"]) md.push(`- ${L}. ${qq.options[L]}`); md.push(""); key.push(`**${qq.number}. ${qq.correct}** — _${qq.type}_ · ${qq.explanation}`); }
}
md.push("---"); md.push("# Answer Key (Teacher)"); md.push(""); md.push(...key);
fs.writeFileSync("output/reading_23_met_subjects_77_questions.md", md.join("\n"));
console.log("Generated", fs.readdirSync("output").join(", "));
