// Platonic dialogues: Thrasyllan tetralogies + study excerpts (public domain / summary)
export const tetralogies = [
  {
    name: 'Tetralogy 1',
    theme: 'Trial and death of Socrates',
    dialogues: [
      { id: 'euthyphro', title: 'Euthyphro', theme: 'Piety', short: 'Definition of piety before Socrates\' trial.' },
      { id: 'apology', title: 'Apology', theme: 'Defense of philosophy', short: 'Socrates\' defense at his trial.' },
      { id: 'crito', title: 'Crito', theme: 'Law and obligation', short: 'Whether Socrates should escape prison.' },
      { id: 'phaedo', title: 'Phaedo', theme: 'Immortality of the soul', short: 'Socrates\' last day; arguments for the soul.' },
    ],
  },
  {
    name: 'Tetralogy 2',
    theme: 'Knowledge and language',
    dialogues: [
      { id: 'cratylus', title: 'Cratylus', theme: 'Names and nature', short: 'Whether names are natural or conventional.' },
      { id: 'theaetetus', title: 'Theaetetus', theme: 'What is knowledge?', short: 'Definition of knowledge; perception, true belief.' },
      { id: 'sophist', title: 'Sophist', theme: 'Being and non-being', short: 'Definition of the sophist; dialectic.' },
      { id: 'statesman', title: 'Statesman', theme: 'Political expertise', short: 'The art of statesmanship; myth of the ages.' },
    ],
  },
  {
    name: 'Tetralogy 3',
    theme: 'Love, soul, and metaphysics',
    dialogues: [
      { id: 'parmenides', title: 'Parmenides', theme: 'Forms and dialectic', short: 'Critique of Forms; training in dialectic.' },
      { id: 'philebus', title: 'Philebus', theme: 'Pleasure and the good', short: 'Pleasure vs. reason in the good life.' },
      { id: 'symposium', title: 'Symposium', theme: 'Love (eros)', short: 'Speeches on love; Diotima\'s ladder.' },
      { id: 'phaedrus', title: 'Phaedrus', theme: 'Love, soul, rhetoric', short: 'Soul as charioteer; true rhetoric.' },
    ],
  },
  {
    name: 'Tetralogy 6',
    theme: 'Virtue and rhetoric',
    dialogues: [
      { id: 'euthydemus', title: 'Euthydemus', theme: 'Eristic vs. dialectic', short: 'Eristic sophists vs. Socratic method.' },
      { id: 'protagoras', title: 'Protagoras', theme: 'Can virtue be taught?', short: 'Protagoras on virtue; unity of virtue.' },
      { id: 'gorgias', title: 'Gorgias', theme: 'Rhetoric and justice', short: 'Rhetoric, power, and the just life.' },
      { id: 'meno', title: 'Meno', theme: 'Virtue and recollection', short: 'Can virtue be taught? Recollection; slave boy.' },
    ],
  },
  {
    name: 'Tetralogy 8',
    theme: 'Politics and cosmos',
    dialogues: [
      { id: 'clitophon', title: 'Clitophon', theme: 'Short critique', short: 'Brief dialogue; Clitophon\'s challenge.' },
      { id: 'republic', title: 'Republic', theme: 'Justice and the ideal city', short: 'Justice, soul, city, philosopher-kings, cave.' },
      { id: 'timaeus', title: 'Timaeus', theme: 'Cosmogony', short: 'Creation of the cosmos; demiurge.' },
      { id: 'critias', title: 'Critias', theme: 'Atlantis', short: 'Story of Atlantis (incomplete).' },
    ],
  },
  {
    name: 'Tetralogy 9',
    theme: 'Law and wisdom',
    dialogues: [
      { id: 'minos', title: 'Minos', theme: 'What is law?', short: 'Definition of law.' },
      { id: 'laws', title: 'Laws', theme: 'Second-best city', short: 'Constitution for Magnesia; no philosopher-kings.' },
      { id: 'epinomis', title: 'Epinomis', theme: 'Wisdom and astronomy', short: 'How to become wise; role of number.' },
    ],
  },
];

// Sample passages for study (short excerpts / summaries for fair use; expand with your own texts)
export const passages = {
  euthyphro: [
    { speaker: 'Socrates', text: 'What is piety? Is the pious being loved by the gods because it is pious, or is it pious because it is being loved by the gods?' },
    { speaker: 'Euthyphro', text: 'Piety is what I am doing—prosecuting the wrongdoer.' },
  ],
  apology: [
    { speaker: 'Socrates', text: 'The unexamined life is not worth living for a human being.' },
    { speaker: 'Socrates', text: 'I was attached to this city by the god—though it seems absurd—as upon a great and noble horse which was somewhat sluggish because of its size.' },
  ],
  crito: [
    { speaker: 'Socrates', text: 'One must never do wrong, not even in return for wrong done to oneself.' },
    { speaker: 'Socrates', text: 'We should not value living above living well.' },
  ],
  phaedo: [
    { speaker: 'Socrates', text: 'Those who rightly philosophize are practicing dying.' },
    { speaker: 'Socrates', text: 'If the soul is immortal, it demands our care not only for the time we call life but for all time.' },
  ],
  meno: [
    { speaker: 'Socrates', text: 'As the soul is immortal, has been born often, and has seen all things here and in Hades, there is nothing it has not learned.' },
    { speaker: 'Socrates', text: 'Virtue would be neither natural nor taught, but comes to those who possess it by divine dispensation.' },
  ],
  symposium: [
    { speaker: 'Diotima', text: 'Love is of the good’s being one’s own forever.' },
    { speaker: 'Diotima', text: 'The correct way to go about love is to begin from the beauties here and ascend for the sake of that beauty above.' },
  ],
  republic: [
    { speaker: 'Socrates', text: 'Until philosophers rule as kings or those who are now called kings genuinely philosophize, cities will have no rest from evils.' },
    { speaker: 'Socrates', text: 'In the soul there is a part that reasons and a part that is reasoned to. The just man does not allow the parts to meddle with each other.' },
  ],
  gorgias: [
    { speaker: 'Socrates', text: 'It is better to suffer wrong than to do wrong.' },
    { speaker: 'Socrates', text: 'Rhetoric is a knack of flattery, not an art.' },
  ],
  theaetetus: [
    { speaker: 'Socrates', text: 'Wonder is the only beginning of philosophy.' },
    { speaker: 'Socrates', text: 'Knowledge is true judgment with an account.' },
  ],
  phaedrus: [
    { speaker: 'Socrates', text: 'The soul is immortal; for that which is ever in motion is immortal.' },
    { speaker: 'Socrates', text: 'Writing has this strange quality: it reminds you when you need help, but it does not teach.' },
  ],
};

// Default passages for dialogues not in the passages object
export function getPassages(dialogueId) {
  return passages[dialogueId] || [
    { speaker: 'Socrates', text: `Study this dialogue to explore its main theme and arguments. Add your own passages in src/data/dialogues.js.` },
  ];
}

// Flashcards: concept → dialogue / short answer
export const flashcards = [
  { front: 'What is the Euthyphro dilemma?', back: 'Is the pious loved by the gods because it is pious, or is it pious because it is loved? (Euthyphro)' },
  { front: 'What is the “unexamined life” quote?', back: '“The unexamined life is not worth living for a human being.” (Apology)' },
  { front: 'What does Socrates say about doing wrong in Crito?', back: 'One must never do wrong, not even in return for wrong done to oneself.' },
  { front: 'What is “recollection” in the Meno?', back: 'Learning as remembering what the immortal soul already knew.' },
  { front: 'What is Diotima’s ladder (Symposium)?', back: 'Ascent from love of beautiful bodies → beautiful souls → laws and practices → knowledge → the Form of Beauty.' },
  { front: 'What are the three parts of the soul in the Republic?', back: 'Reason, spirit (thumos), and appetite.' },
  { front: 'What is the allegory of the cave?', back: 'Prisoners see shadows; one is freed and sees the fire and then the sun (Form of the Good). (Republic)' },
  { front: 'What does Socrates say about rhetoric in Gorgias?', back: 'Rhetoric is a knack of flattery, not a true art.' },
  { front: 'What is the soul compared to in the Phaedrus?', back: 'A charioteer with two horses (reason, noble passion, base desire).' },
  { front: 'What does Socrates say about philosophy and dying (Phaedo)?', back: 'Those who rightly philosophize are practicing dying.' },
];

export function getAllDialogues() {
  return tetralogies.flatMap(t => t.dialogues.map(d => ({ ...d, tetralogy: t.name })));
}

export function getDialogueById(id) {
  return getAllDialogues().find(d => d.id === id) || null;
}
