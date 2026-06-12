export type Slide = {
  id: number;
  title: string;
  body: string;
  order_index: number;
  image_url: string;
};

export type Example = {
  id: number;
  title: string;
  content: string;
};

export type InteractiveTask = {
  id: number;
  task_type: string;
  prompt: string;
  expected_answer: string;
};

export type Lesson = {
  id: number;
  title: string;
  short_description: string;
  learning_goals: string;
  theory: string;
  key_terms: string;
  real_world_example: string;
  step_by_step: string;
  common_mistakes: string;
  practical_use_case: string;
  summary: string;
  order_index: number;
  next_lesson_id?: number | null;
  slides: Slide[];
  examples: Example[];
  interactive_tasks: InteractiveTask[];
};

export type Module = {
  id: number;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
};

export type Course = {
  id: number;
  title: string;
  section: string;
  description: string;
  modules: Module[];
};
