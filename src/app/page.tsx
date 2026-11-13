"use client";
import { useState } from "react";

export default function Home() {
  const [tasks, setTasks] = useState<string[]>(["Deploy CI/CD pipeline"]);
  const [input, setInput] = useState("");

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTasks([...tasks, input.trim()]);
    setInput("");
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  return (
    <main className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-md text-black">
      <h1 className="text-2xl font-bold mb-4">Sprint Task Board</h1>
      <form onSubmit={addTask} className="flex gap-2 mb-6">
        <input
          aria-label="Task2 Input"
          type="text"
          placeholder="Add a new task2..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Task
        </button>
      </form>
      <ul className="space-y-2">
        {tasks.map((task, idx) => (
          <li key={idx} className="flex justify-between items-center border p-2 rounded">
            <span>{task}</span>
            <button
              onClick={() => removeTask(idx)}
              className="text-red-600 text-sm font-semibold"
              aria-label={`Delete task: ${task}`}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
