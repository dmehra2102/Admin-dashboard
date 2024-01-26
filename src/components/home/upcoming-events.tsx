import { CalendarOutlined } from "@ant-design/icons";
import { Badge, Card, List } from "antd";
import React, { useState } from "react";
import { UpcomingEventsSkeleton } from "@/components";
import { Text } from "../text";
import { getDate } from "@/utilities/helpers";
import { useList } from "@refinedev/core";
import { DASHBORAD_CALENDAR_UPCOMING_EVENTS_QUERY } from "@/graphql/queries";
import dayjs from "dayjs";

const UpcomingEvents = () => {
  const { data, isLoading: upcomingEventsDataLoading } = useList({
    resource: "events",
    pagination: { pageSize: 5 },
    meta: {
      gqlQuery: DASHBORAD_CALENDAR_UPCOMING_EVENTS_QUERY,
    },
    sorters: [{ field: "startDate", order: "asc" }],
    filters: [
      {
        field: "startDate",
        operator: "gte",
        value: dayjs().format("YYYY-MM-DD"),
      },
    ],
  });
  return (
    <Card
      style={{ height: "100%" }}
      headStyle={{ padding: "8px 16px" }}
      bodyStyle={{ padding: "0 1rem" }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <CalendarOutlined style={{ fontSize: "20px" }} />{" "}
          <Text size="lg" style={{ marginLeft: "0.7rem" }}>
            Upcoming Events
          </Text>
        </div>
      }
    >
      {upcomingEventsDataLoading ? (
        <List
          itemLayout="horizontal"
          dataSource={Array.from({ length: 5 }).map((_, index) => ({ id: index }))}
          renderItem={(_, index) => <UpcomingEventsSkeleton key={index} />}
        />
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={data?.data || []}
          renderItem={(item) => {
            const renderDate = getDate(item.startDate, item.endDate);

            return (
              <List.Item>
                <List.Item.Meta
                  avatar={<Badge color={item.color} />}
                  title={<Text size="sm">{renderDate}</Text>}
                  description={
                    <Text ellipsis={{ tooltip: true }} strong size="md">
                      {item.title}
                    </Text>
                  }
                ></List.Item.Meta>
              </List.Item>
            );
          }}
        />
      )}

      {!upcomingEventsDataLoading && data?.data?.length === 0 && (
        <span
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "220px",
          }}
        >
          No Upcoming events
        </span>
      )}
    </Card>
  );
};

export default UpcomingEvents;
