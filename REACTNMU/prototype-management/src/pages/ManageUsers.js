import { useEffect, useState } from "react";
import api from "../api/api";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("users/manage_users/");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  return (
    <div>
      <h2>User Management</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.role})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageUsers;
