# **App Name**: Number Sense Tutor

## Core Features:

- AI Question Generation: AI-powered question generator. Generates numerical estimation questions, and provides the answer as a tool, based on topic-specific prompts and example questions from a static JSON file.
- Practice View: Practice view that allows the user to enter an estimate and receive immediate feedback. Automatically transitions to the next question, using the correct answer if available.
- Error feedback modal: Modal window that displays detailed feedback on incorrect answers, including the correct answer.
- Progress Tracking: Tracks user progress and statistics (accuracy, questions attempted) and stores them locally using localStorage, with forward compatibility.
- Customizable Settings: Settings view allows users to adjust the number of questions per practice set and toggle dark mode.
- Home view: Home view that dynamically renders a list of topics, each with an indicator reflecting the user's progress (not started, in progress, completed).
- Settings: Comprehensive settings view to tweak the practice experience.

## Style Guidelines:

- Primary color: Vivid blue (#29ABE2) for trustworthiness and intelligence, creating a focused and engaging learning environment.
- Background color: Light blue (#E0F7FA) for a calm, clean learning backdrop.
- Accent color: Bright orange (#FF8C00) for highlights and important calls to action.
- Body text: 'PT Sans', a humanist sans-serif, which ensures readability and a modern feel for the user.
- Headlines: 'Space Grotesk', a proportional sans-serif, which gives a contemporary, scientific look.
- Code snippets: 'Source Code Pro', to differentiate code snippets or technical terms, without clashing.
- Use simple, geometric icons, sourced from a library such as Font Awesome or an SVG set.
- Use a clean, centered layout to focus attention. Employ flexbox for alignment.
- Incorporate subtle animations like fading transitions between questions, a border flash on correct answers, and a fade-in/out effect for modals.