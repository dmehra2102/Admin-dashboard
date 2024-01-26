import {
  KanbanAddCardButton,
  KanbanBoardContainer,
  KanbanColumn,
  KanbanColumnSkeleton,
  KanbanItem,
  ProjectCardMemo,
  ProjectCardSkeleton,
} from "@/components";
import { KanbanBoard } from "@/components/tasks/kanban/board";
import { UPDATE_TASK_STAGE_MUTATION } from "@/graphql/mutations";
import { TASKS_QUERY, TASK_STAGES_QUERY } from "@/graphql/queries";
import { TaskStage } from "@/graphql/schema.types";
import { TasksQuery } from "@/graphql/types";
import { DragEndEvent } from "@dnd-kit/core";
import { useList, useNavigation, useUpdate } from "@refinedev/core";
import { GetFieldsFromList } from "@refinedev/nestjs-query";
import React, { useMemo } from "react";

export const TaskList = ({ children }: React.PropsWithChildren) => {
  const { replace } = useNavigation();

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

  const { mutate: updateTask } = useUpdate();

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

  const handleAddCard = ({ stageId }: { stageId: string }) => {
    const path = stageId === "unassigned" ? "/tasks/new" : `/tasks/new?stageId=${stageId}`;

    replace(path);
  };

  const handleOnDragEnd = (event: DragEndEvent) => {
    let stageId = event.over?.id as undefined | string | null;
    const taskId = event.active.id as string;
    const taskStageId = event.active.data.current?.stageId;

    if (stageId === taskStageId) return;

    if (stageId === "unassigned") {
      stageId = null;
    }

    updateTask({
      resource: "tasks",
      id: taskId,
      values: {
        stageId: stageId,
      },
      successNotification: false,
      mutationMode: "optimistic",
      meta: {
        gqlMutation: UPDATE_TASK_STAGE_MUTATION,
      },
    });
  };

  const isLoading = isStageDataLoading || isTasksDataLoading;
  if (isLoading) return <PageSkeleton />;

  return (
    <>
      <KanbanBoardContainer>
        <KanbanBoard onDragEnd={handleOnDragEnd}>
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

            {!taskStages.unassignedStage.length && <KanbanAddCardButton onClick={() => handleAddCard({ stageId: "unassigned" })} />}
          </KanbanColumn>
          {taskStages.columns?.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              count={column.tasks.length}
              onAddClick={() => handleAddCard({ stageId: column.id })}
            >
              {!isLoading &&
                column.tasks.map((task) => (
                  <KanbanItem key={task.id} id={task.id} data={task}>
                    <ProjectCardMemo {...task} dueDate={task.dueDate || undefined} />
                  </KanbanItem>
                ))}
              {!column.tasks.length && <KanbanAddCardButton onClick={() => handleAddCard({ stageId: column.id })} />}
            </KanbanColumn>
          ))}
        </KanbanBoard>
      </KanbanBoardContainer>
      {children}
    </>
  );
};

const PageSkeleton = () => {
  const columnCount = 6;
  const itemCount = 4;
  return (
    <KanbanBoardContainer>
      {Array.from({ length: columnCount }).map((_, index) => (
        <KanbanColumnSkeleton key={index}>
          {Array.from({ length: itemCount }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </KanbanColumnSkeleton>
      ))}
    </KanbanBoardContainer>
  );
};
