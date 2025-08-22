import React from "react";

function TaskList({ tasks }) {
  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-item">
          {task.title}
        </div>
      ))}
    </div>
  );
}

export default TaskList;
