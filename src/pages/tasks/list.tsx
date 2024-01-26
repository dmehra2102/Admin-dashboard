import { KanbanBoardContainer, KanbanColumn, KanbanItem, ProjectCardMemo } from "@/components";
import { KanbanBoard } from "@/components/tasks/kanban/board";
import { TASKS_QUERY, TASK_STAGES_QUERY } from "@/graphql/queries";
import { TaskStage } from "@/graphql/schema.types";
import { TasksQuery } from "@/graphql/types";
import { useList } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import React, { useMemo } from "react";

export const TaskList = () => {
  const { data: stages, isLoading: isStageDataLoading } = useList<TaskStage>({
    resource: "taskStages",
    filters: [
      {
        field: "title",
        operator: "in",
        value: ["TODO", "IN PROGRESS", "IN REVIEW", "DONE"],
      },
    ],
    sorters: [
      {
        field: "createdAt",
        order: "asc",
      },
    ],
    meta: {
      gqlQuery: TASK_STAGES_QUERY,
    },
  });
  const { data: tasks, isLoading: isTasksDataLoading } = useList<GetFieldsFromList<TasksQuery>>({
    resource: "tasks",
    sorters: [
      {
        field: "dueDate",
        order: "asc",
      },
    ],
    queryOptions: {
      enabled: !!stages,
    },
    pagination: {
      mode: "off",
    },
    meta: {
      gqlQuery: TASKS_QUERY,
    },
  });

  const taskStages = useMemo(() => {
    if (!stages?.data || !tasks?.data) {
      return {
        unassignedStage: [],
        stages: [],
      };
    }

    const unassignedStage = tasks.data.filter((task) => task?.stageId === null);

    const grouped: TaskStage[] = stages.data.map((stage) => ({
      ...stage,
      tasks: tasks.data.filter((task) => task?.stageId?.toString() === stage.id),
    }));

    return {
      unassignedStage,
      columns: grouped,
    };
  }, [stages, tasks]);

  const handleAddCard = ({ stageId }: { stageId: string }) => {};

  return (
    <KanbanBoardContainer>
      <KanbanBoard>
        <KanbanColumn
          id="unassigned"
          title="unassigned"
          count={taskStages.unassignedStage.length || 0}
          onAddClick={() => handleAddCard({ stageId: "unassigned" })}
        >
          {taskStages.unassignedStage.map((task) => (
            <KanbanItem key={task.id} id={task.id} data={{ ...task, stageId: "unassigned" }}>
              <ProjectCardMemo {...task} dueDate={task.dueDate || undefined} />
            </KanbanItem>
          ))}
        </KanbanColumn>
      </KanbanBoard>
    </KanbanBoardContainer>
  );
};
