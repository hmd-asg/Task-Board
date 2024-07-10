
const taskTitleInput = $('#task-title');
const taskDueInput = $('#task-due');
const taskDescriptionInput = $('#task-description');
const btnAddTask = $('#add-task');

function readDataStorage() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function generateTaskId() {
  const taskId = crypto.randomUUID();
  return taskId;
}

function createTaskCard(task) {

  const taskCard = $('<div>').addClass('card draggable my-3');
  taskCard.attr('data-task-id', task.id);
  const cardHeader = $('<div>').addClass('card-header').text(task.title);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').text(task.description);
  const cardDue = $('<p>').text(task.dueDate);
  const cardBtnDelete = $('<button>').addClass('btn btn-danger delete').text('Delete');
  cardBtnDelete.attr('data-task-id', task.id);
  cardBtnDelete.on('click', handleDeleteTask);

  cardBody.append(cardDescription, cardDue, cardBtnDelete);
  taskCard.append(cardHeader, cardBody);

  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const taskDue = dayjs(task.dueDate, 'MM/DD/YYYY');
    if (now.isSame(taskDue, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDue)) {
      taskCard.addClass('bg-danger text-white');
    }
  }
  return taskCard;
}

function renderTaskList() {
  const todoCard = $('#todo-cards');
  todoCard.empty();

  const inpPogressCard = $('#in-progress-cards');
  inpPogressCard.empty();

  const doneCard = $('#done-cards');
  doneCard.empty();

  const tasks = readDataStorage();

  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoCard.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inpPogressCard.append(createTaskCard(task));
    }
    else if (task.status === 'done') {
      doneCard.append(createTaskCard(task));
    }
  }

  // ? Use JQuery UI to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    // ? This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // ? Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // ? Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
}

function handleAddTask() {

  const taskTitle = taskTitleInput.val().trim();
  const taskDescription = taskDescriptionInput.val().trim();
  const taskDueDate = taskDueInput.val();

  const task = {
    id: generateTaskId(),
    title: taskTitle,
    description: taskDescription,
    dueDate: taskDueDate,
    status: 'to-do'
  }
  const tasks = readDataStorage();
  tasks.push(task);
  localStorage.setItem('tasks', JSON.stringify(tasks));

  taskTitleInput.val('');
  taskDescriptionInput.val('');
  taskDueInput.val('');

  renderTaskList();
}

function handleDeleteTask(event) {

  const taskId = $(event.target).attr('data-task-id');
  const tasks = readDataStorage();

  tasks.forEach(task => {
    if (task.id === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}

function handleDrop(event, ui) {

  const tasks = readDataStorage();
  const taskId = ui.draggable[0].dataset.taskId;

  const newStatus = event.target.id;

  for (let task of tasks) {
    if (task.id === taskId) {
      task.status = newStatus;
    }
  }
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTaskList();
}

btnAddTask.on('click', handleAddTask);
$(document).ready(function () {
  renderTaskList();

  $('.lane').droppable({
    accept: '.draggable',
    drop: handleDrop,
  });

  $(function () {
    $('#task-due').datepicker({
      changeMonth: true,
      changeYear: true,
    });
  });
});
