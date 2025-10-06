import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Task = {
  id: number;
  title: string;
  desc: string;
  created_at: string;
};

const TodoList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", desc: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  // Fetch tasks
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      toast.error(`Error fetching tasks: ${error.message}`);
      return;
    }

    setTasks(data || []);
  };

  // Add or update task
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newTask.title.trim() || !newTask.desc.trim()) {
      toast.warn("⚠️ Please fill in both the title and description!");
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("tasks")
        .update({
          title: newTask.title,
          desc: newTask.desc,
        })
        .eq("id", editingId);

      if (error) {
        toast.error(`Error updating task: ${error.message}`);
        return;
      }

      toast.success("Task updated successfully!");
      setEditingId(null);
    } else {
      const { error } = await supabase.from("tasks").insert(newTask).single();

      if (error) {
        toast.error(`Error inserting task: ${error.message}`);
        return;
      }

      toast.success("Task added successfully!");
    }

    setNewTask({ title: "", desc: "" });
    fetchData();
  };

  // Delete task
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error(`Error deleting task: ${error.message}`);
      return;
    }

    toast.info("🗑️ Task deleted successfully!");
    fetchData();
  };

  // Edit task
  const handleEdit = (task: Task) => {
    setNewTask({ title: task.title, desc: task.desc });
    setEditingId(task.id);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="w-full max-w-lg mt-16 border p-6 mx-auto rounded-lg shadow-md bg-white">
      <ToastContainer position="top-right" autoClose={2500} />

      <h1 className="text-2xl font-bold mb-4 text-center text-gray-700">
        📝 Supabase Todo List
      </h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="font-semibold block mb-1">Title</label>
          <input
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            value={newTask.title}
            type="text"
            placeholder="Enter task title"
            className="border w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">Description</label>
          <textarea
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, desc: e.target.value }))
            }
            value={newTask.desc}
            placeholder="Enter description"
            className="border w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className={`py-2 rounded-md text-white font-semibold transition ${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {editingId ? "Update Task" : "Add Task"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setNewTask({ title: "", desc: "" });
              toast.info("✏️ Edit cancelled");
            }}
            className="py-2 rounded-md bg-gray-300 hover:bg-gray-400 transition font-semibold"
          >
            Cancel Edit
          </button>
        )}
      </form>

      {/* Task List */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-3 text-gray-700">Tasks</h2>
        <ul className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center text-sm">No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <li
                key={task.id}
                className="border p-3 rounded-md bg-gray-50 hover:bg-gray-100 relative transition"
              >
                <div>
                  <p className="font-semibold text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-600">{task.desc}</p>
                </div>
                <div className="absolute top-2 right-2 space-x-2">
                  <button
                    onClick={() => handleEdit(task)}
                    className="px-2 py-1 border text-sm bg-yellow-400 hover:bg-yellow-300 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="px-2 py-1 border text-sm bg-red-500 text-white hover:bg-red-400 rounded"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default TodoList;
