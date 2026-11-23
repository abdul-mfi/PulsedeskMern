"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchJobs } from "../../store/slices/jobsSlice";
import { showToast } from "../../store/slices/uiSlice";
import Button from "../../components/ui/Button";
import API from "../../lib/api";

export default function JobsDeadlineStatusButton() {
  const dispatch = useDispatch();

  const submit = async () => {
    try {
      await API.get("/deadline-checker/checkAndUpdateWorkStatus");
      dispatch(
        showToast({ message: "Deadline status updated!", type: "success" }),
      );
      dispatch(fetchJobs()); // refresh the jobs list after updating the status
    } catch (error) {
      dispatch(
        showToast({
          message: "Failed to update deadline status",
          type: "error",
        }),
      );
    }
  };

  useEffect(() => {
    const lastRun = localStorage.getItem("deadlineCheckDate");
    const today = new Date().toISOString().split("T")[0];

    if (lastRun !== today) {
      submit();
      localStorage.setItem("deadlineCheckDate", today);
    }
  }, []);

  return (
    <div className="ml-auto flex gap-2">
      <Button onClick={submit}>Refresh Job Status</Button>
    </div>
  );
}
