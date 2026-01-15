import styled from "@emotion/styled";
import {
  Close,
  ContentCopy,
  DeleteRounded,
  Done,
  EditRounded,
  LaunchRounded,
} from "@mui/icons-material";
import { Divider, Menu, MenuItem } from "@mui/material";
import { JSX, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BottomSheet } from "react-spring-bottom-sheet";
import "react-spring-bottom-sheet/dist/style.css";
import { TaskIcon, TaskItem } from "..";
import { UserContext } from "../../contexts/UserContext";
import { useResponsiveDisplay } from "../../hooks/useResponsiveDisplay";
import { Task } from "../../types/user";
import { generateUUID, showToast } from "../../utils";
import { TaskContext } from "../../contexts/TaskContext";
import { ColorPalette } from "../../theme/themeConfig";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

export const TaskMenu = () => {
  const { user, setUser } = useContext(UserContext);
  const { tasks } = user;
  const {
    selectedTaskId,
    anchorEl,
    anchorPosition,
    setEditModalOpen,
    handleDeleteTask,
    handleCloseMoreMenu,
  } = useContext(TaskContext);
  const isMobile = useResponsiveDisplay();
  const n = useNavigate();
  const prefersReducedMotion = usePrefersReducedMotion(user.settings.reduceMotion);

  const selectedTask = useMemo(() => {
    return tasks.find((task) => task.id === selectedTaskId) || ({} as Task);
  }, [selectedTaskId, tasks]);

  const redirectToTaskDetails = () => {
    const taskId = selectedTask?.id.toString().replace(".", "");
    n(`/task/${taskId}`);
  };

  const handleMarkAsDone = () => {
    // Toggles the "done" property of the selected task
    if (selectedTaskId) {
      handleCloseMoreMenu();
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTaskId) {
          return { ...task, done: !task.done, lastSave: new Date() };
        }
        return task;
      });
      setUser((prevUser) => ({
        ...prevUser,
        tasks: updatedTasks,
      }));

      const allTasksDone = updatedTasks.every((task) => task.done);

      if (allTasksDone) {
        showToast(
          <div>
            <b>All tasks done</b>
            <br />
            <span>You've checked off all your todos. Well done!</span>
          </div>,
          {
            icon: (
              <div style={{ margin: "-6px 4px -6px -6px" }}>
                <TaskIcon variant="success" scale={0.18} />
              </div>
            ),
          },
        );
      }
    }
  };

  const handleDuplicateTask = () => {
    handleCloseMoreMenu();
    if (selectedTaskId) {
      if (selectedTask) {
        // Create a duplicated task with a new ID and current date
        const duplicatedTask: Task = {
          ...selectedTask,
          id: generateUUID(),
          date: new Date(),
          lastSave: undefined,
        };
        // Add the duplicated task to the existing tasks
        const updatedTasks = [...tasks, duplicatedTask];
        // Update the user object with the updated tasks
        setUser((prevUser) => ({
          ...prevUser,
          tasks: updatedTasks,
        }));
      }
    }
  };

  const menuItems: JSX.Element[] = [
    <StyledMenuItem key="done" onClick={handleMarkAsDone}>
      {selectedTask.done ? <Close /> : <Done />}
      &nbsp; {selectedTask.done ? "Mark as not done" : "Mark as done"}
    </StyledMenuItem>,

    <StyledMenuItem key="details" onClick={redirectToTaskDetails}>
      <LaunchRounded /> &nbsp; Task details
    </StyledMenuItem>,

    <Divider key="divider-1" />,

    <StyledMenuItem
      key="edit"
      onClick={() => {
        setEditModalOpen(true);
        handleCloseMoreMenu();
      }}
    >
      <EditRounded /> &nbsp; Edit
    </StyledMenuItem>,

    <StyledMenuItem key="duplicate" onClick={handleDuplicateTask}>
      <ContentCopy /> &nbsp; Duplicate
    </StyledMenuItem>,

    <Divider key="divider-2" />,

    <StyledMenuItem
      key="delete"
      clr={ColorPalette.red}
      onClick={() => {
        handleDeleteTask();
        handleCloseMoreMenu();
      }}
    >
      <DeleteRounded /> &nbsp; Delete
    </StyledMenuItem>,
  ];

  const sheet = (
    <BottomSheet
      open={prefersReducedMotion ? true : Boolean(anchorEl)}
      onDismiss={handleCloseMoreMenu}
      snapPoints={({ minHeight, maxHeight }) => [minHeight, maxHeight]}
      expandOnContentDrag
      header={
        <div
          style={{
            textAlign: "left",
            backdropFilter: "blur(8px)",
          }}
        >
          <TaskItem task={selectedTask} features={{ enableGlow: false }} />
          <Divider sx={{ mt: "20px", mb: "-20px" }} />
        </div>
      }
    >
      <SheetContent>{menuItems}</SheetContent>
      <div style={{ marginBottom: "48px" }} />
    </BottomSheet>
  );

  return (
    <>
      {/* close sheet instantly if motion is reduced */}
      {isMobile && (prefersReducedMotion ? Boolean(anchorEl) && sheet : sheet)}

      {!isMobile && (
        <Menu
          id="task-menu"
          anchorEl={anchorEl}
          anchorPosition={anchorPosition ? anchorPosition : undefined}
          anchorReference={anchorPosition ? "anchorPosition" : undefined}
          open={Boolean(anchorEl)}
          onClose={handleCloseMoreMenu}
          sx={{
            "& .MuiPaper-root": {
              borderRadius: "18px",
              minWidth: "200px",
              boxShadow: "none",
              padding: "6px 4px",
            },
          }}
          slotProps={{
            list: {
              "aria-labelledby": "more-button",
            },
          }}
        >
          {menuItems}
        </Menu>
      )}
    </>
  );
};

const SheetContent = styled.div`
  color: ${({ theme }) => (theme.darkmode ? ColorPalette.fontLight : ColorPalette.fontDark)};
  margin: 20px 10px;
  & .MuiMenuItem-root {
    font-size: 16px;
    padding: 16px;
    &::before {
      content: "";
      display: inline-block;
      margin-right: 10px;
    }
  }
`;
const StyledMenuItem = styled(MenuItem)<{ clr?: string }>`
  margin: 0 6px;
  padding: 10px;
  border-radius: 12px;
  box-shadow: none;
  gap: 2px;
  color: ${({ clr }) => clr || "unset"};
`;
