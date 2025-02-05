import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

interface Task {
  id: string;
  nama: string;
  prioritas: string;
  status: boolean;
  tanggal: string;
}

const TambahDanDaftarTugas = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = collection(db, 'toDoList');
      const tasksSnapshot = await getDocs(tasksCollection);
      const tasksList = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setTasks(tasksList);
      setLoading(false);
    };

    fetchTasks();
  }, []);

  const handleAddTask = async (nama: string, prioritas: string, tanggal: string) => {
    const newTask = { nama, prioritas, status: false, tanggal };
    const docRef = await addDoc(collection(db, 'toDoList'), newTask);
    setTasks([...tasks, { id: docRef.id, ...newTask }]);
  };

  const handleDeleteTask = async (id: string) => {
    await deleteDoc(doc(db, 'toDoList', id));
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleUpdateTask = async (id: string, updatedTask: Partial<Task>) => {
    await updateDoc(doc(db, 'toDoList', id), updatedTask);
    setTasks(tasks.map(task => (task.id === id ? { ...task, ...updatedTask } : task)));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const sortedTasks = tasks.sort((a, b) => {
    if (a.prioritas === b.prioritas) return 0;
    return a.prioritas === 'Tinggi' ? -1 : 1;
  });

  const completedTasks = sortedTasks.filter(task => task.status);
  const incompleteTasks = sortedTasks.filter(task => !task.status);

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Tambah Tugas</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const nama = (form.elements.namedItem('nama') as HTMLInputElement).value;
            const prioritas = (form.elements.namedItem('prioritas') as HTMLSelectElement).value;
            const tanggal = (form.elements.namedItem('tanggal') as HTMLInputElement).value;
            handleAddTask(nama, prioritas, tanggal);
            form.reset();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nama">
              Nama Tugas
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="nama"
              type="text"
              placeholder="Nama Tugas"
              name="nama"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="prioritas">
              Prioritas
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="prioritas"
              name="prioritas"
              required
            >
              <option value="Tinggi">Tinggi</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tanggal">
              Tanggal
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="tanggal"
              type="date"
              placeholder="Tanggal"
              name="tanggal"
              required
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Tambah Tugas
          </button>
        </form>

        <h2 className="text-2xl font-bold mt-8 mb-4">Daftar Tugas Belum Selesai</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Nama Tugas</th>
              <th className="py-2 px-4 border-b">Prioritas</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Tanggal</th>
              <th className="py-2 px-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {incompleteTasks.map((task, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{task.nama}</td>
                <td className="py-2 px-4 border-b">{task.prioritas}</td>
                <td className="py-2 px-4 border-b">{task.status ? 'Selesai' : 'Belum Selesai'}</td>
                <td className="py-2 px-4 border-b">{task.tanggal}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleUpdateTask(task.id, { status: !task.status })}
                  >
                    {task.status ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-2xl font-bold mt-8 mb-4">Daftar Tugas Telah Selesai</h2>
        <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b">Nama Tugas</th>
              <th className="py-2 px-4 border-b">Prioritas</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Tanggal</th>
              <th className="py-2 px-4 border-b">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((task, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{task.nama}</td>
                <td className="py-2 px-4 border-b">{task.prioritas}</td>
                <td className="py-2 px-4 border-b">{task.status ? 'Selesai' : 'Belum Selesai'}</td>
                <td className="py-2 px-4 border-b">{task.tanggal}</td>
                <td className="py-2 px-4 border-b flex space-x-2">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleUpdateTask(task.id, { status: !task.status })}
                  >
                    {task.status ? 'Tandai Belum Selesai' : 'Tandai Selesai'}
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded focus:outline-none focus:shadow-outline"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TambahDanDaftarTugas;