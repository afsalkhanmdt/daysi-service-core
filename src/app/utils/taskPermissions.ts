import { MemberType, MemberResponse } from "@/app/types/familyMemberTypes";
import { PMTransStatus, PMTask } from "@/app/types/pocketMoney";
import { ToDoStatus, ToDoTaskType } from "@/app/types/todo";

export const BACKEND_ERROR_MESSAGES: Record<number, string> = {
  123: "You can only edit Pocket Money tasks assigned to you.",
  127: "Only Family Admins can approve Pocket Money tasks.",
  130: "You do not have permission to update this ToDo task.",
  131: "This task no longer exists.",
};

export const BACKEND_ERROR_NAME_MAP: Record<string, string> = {
  NOT_ALLOW_TO_UPDATE_PMTASK: "You can only edit Pocket Money tasks assigned to you.",
  NOT_ALLOW_TO_APPROVE_PMTASK: "Only Family Admins can approve Pocket Money tasks.",
  NOT_ALLOW_TO_UPDATE_TODO: "You do not have permission to update this ToDo task.",
  TODO_NOT_FOUND: "This task no longer exists.",
};

/**
 * Extracts error code and human-readable message from backend response or caught exception.
 */
export function getBackendError(resOrErr: any): {
  hasError: boolean;
  errorCode?: number;
  message?: string;
} {
  if (!resOrErr) return { hasError: false };

  // Check if it's an Error instance
  if (resOrErr instanceof Error) {
    const rawMsg = resOrErr.message || "";
    for (const [codeStr, msg] of Object.entries(BACKEND_ERROR_MESSAGES)) {
      if (rawMsg.includes(codeStr)) {
        return { hasError: true, errorCode: Number(codeStr), message: msg };
      }
    }
    for (const [errName, msg] of Object.entries(BACKEND_ERROR_NAME_MAP)) {
      if (rawMsg.includes(errName)) {
        return { hasError: true, message: msg };
      }
    }
    return { hasError: true, message: rawMsg };
  }

  // Check error codes in response object
  const rawCode =
    resOrErr.errorCode ??
    resOrErr.ErrorCode ??
    resOrErr.code ??
    resOrErr.data?.errorCode ??
    resOrErr.data?.ErrorCode;

  if (rawCode !== undefined && rawCode !== null && Number(rawCode) !== 0) {
    const code = Number(rawCode);
    const friendlyMessage =
      BACKEND_ERROR_MESSAGES[code] ||
      resOrErr.message ||
      resOrErr.Message ||
      `Error ${code}`;
    return { hasError: true, errorCode: code, message: friendlyMessage };
  }

  const rawMessage = resOrErr.message || resOrErr.Message || resOrErr.error || "";
  if (typeof rawMessage === "string" && rawMessage.trim()) {
    for (const [errName, msg] of Object.entries(BACKEND_ERROR_NAME_MAP)) {
      if (rawMessage.includes(errName)) {
        return { hasError: true, message: msg };
      }
    }
  }

  if (resOrErr.status === false && resOrErr.data) {
    return { hasError: true, message: String(resOrErr.data) };
  }

  return { hasError: false };
}

/**
 * Helper function replicating the backend ToDo authorization logic:
 * - Family Admin: can edit details and toggle status ONLY if:
 *     1. Task is for whole family (task.isForAll === true OR assigned to family-wide ID), OR
 *     2. Task is assigned to themselves (task.assignedTo.includes(currentAdminMember.id)).
 *   Tasks assigned exclusively to another individual member are read-only for admin.
 * - Family Member: can edit details and toggle status ONLY if:
 *     1. Task is assigned to themselves (task.assignedTo.includes(currentMember.id)), OR
 *     2. Task is for whole family (task.isForAll === true).
 *   Tasks assigned exclusively to another member are read-only.
 */
export function canUpdateToDo(
  task: ToDoTaskType | any,
  currentMember: MemberResponse | any,
  familyWideMemberId?: string
): boolean {
  if (!task || !currentMember) return false;

  const currentMemberId = String(
    currentMember.MemberId ?? currentMember.id ?? currentMember.Id ?? ""
  )
    .trim()
    .toLowerCase();

  const assignedTo = task.AssignedTo ?? task.assignedTo;
  let assignedList: string[] = [];

  if (Array.isArray(assignedTo)) {
    assignedList = assignedTo
      .map((item: any) => {
        if (typeof item === "object" && item !== null) {
          return String(item.MemberId ?? item.id ?? item.Id ?? "");
        }
        return String(item ?? "");
      })
      .filter((s) => Boolean(s))
      .map((s) => s.trim().toLowerCase());

    // Handle single string with commas inside array
    if (assignedList.length === 1 && assignedList[0].includes(",")) {
      assignedList = assignedList[0]
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
    }
  } else if (typeof assignedTo === "string") {
    assignedList = assignedTo
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }

  const isForAll = Boolean(task.IsForAll ?? task.isForAll);
  const isAssignedToFamily =
    isForAll ||
    Boolean(
      familyWideMemberId &&
        assignedList.includes(familyWideMemberId.trim().toLowerCase())
    );

  const isAssignedToMe = Boolean(
    currentMemberId && assignedList.includes(currentMemberId)
  );

  const memberType = Number(
    currentMember.MemberType ?? currentMember.memberType ?? MemberType.Member
  );

  if (memberType === MemberType.FamilyAdmin) {
    // Admin can update tasks assigned to whole family or to themselves
    return isAssignedToFamily || isAssignedToMe;
  } else {
    // Member can update only tasks assigned to them or to whole family
    return isAssignedToMe || isAssignedToFamily;
  }
}

/**
 * Checks if a pocket money task is assigned to a specific member or whole family.
 */
export function isPocketMoneyAssignedToMember(
  task: PMTask | any,
  memberId: string,
  totalFamilyMembersCount?: number
): boolean {
  if (!task || !memberId) return false;
  const normalizedMemberId = String(memberId).trim().toLowerCase();

  // Family-wide check
  if (
    task.FirstComeFirstServe ||
    task.firstComeFirstServe ||
    task.isForAll ||
    task.IsForAll
  ) {
    return true;
  }

  const planned = task.FamilyMembersPlanned ?? task.familyMembersPlanned ?? [];
  if (Array.isArray(planned)) {
    if (totalFamilyMembersCount && planned.length >= totalFamilyMembersCount) {
      return true;
    }
    return planned.some((p: any) => {
      const pId = String(
        typeof p === "string" ? p : p?.MemberId ?? p?.memberId ?? p?.id ?? ""
      )
        .trim()
        .toLowerCase();
      return pId === normalizedMemberId;
    });
  }

  return false;
}

/**
 * Permission check for editing Pocket Money task details:
 * - Family Admin: can view and edit details across Open (0) and Finished (1).
 * - Family Member: can edit details ONLY for tasks where assigned to them or whole family, AND status is Open (0).
 * - Approved (2): read-only for all.
 */
export function canUpdatePocketMoney(
  task: PMTask | any,
  currentMember: MemberResponse | any,
  totalFamilyMembersCount?: number
): boolean {
  if (!task || !currentMember) return false;

  const status = Number(task.Status ?? task.status ?? PMTransStatus.Open);
  if (status === PMTransStatus.Approved || status === PMTransStatus.Deleted) {
    return false;
  }

  const memberType = Number(
    currentMember.MemberType ?? currentMember.memberType ?? MemberType.Member
  );
  const isFamilyAdmin = memberType === MemberType.FamilyAdmin;

  if (isFamilyAdmin) {
    return true;
  }

  // Family member can only edit Open tasks assigned to them or to whole family
  if (status !== PMTransStatus.Open) {
    return false;
  }

  const memberId = String(
    currentMember.MemberId ?? currentMember.id ?? currentMember.Id ?? ""
  );
  return isPocketMoneyAssignedToMember(task, memberId, totalFamilyMembersCount);
}

/**
 * Permission check for advancing Pocket Money task to Finished (1):
 * - Status must be Open (0)
 * - Family Admin: can mark finished
 * - Family Member: can mark finished if assigned to them or whole family
 * - Unassigned: read-only
 */
export function canFinishPocketMoney(
  task: PMTask | any,
  currentMember: MemberResponse | any,
  totalFamilyMembersCount?: number
): boolean {
  if (!task || !currentMember) return false;

  const status = Number(task.Status ?? task.status ?? PMTransStatus.Open);
  if (status !== PMTransStatus.Open) return false;

  const memberType = Number(
    currentMember.MemberType ?? currentMember.memberType ?? MemberType.Member
  );
  if (memberType === MemberType.FamilyAdmin) return true;

  const memberId = String(
    currentMember.MemberId ?? currentMember.id ?? currentMember.Id ?? ""
  );
  return isPocketMoneyAssignedToMember(task, memberId, totalFamilyMembersCount);
}

/**
 * Permission check for approving Pocket Money tasks:
 * - ONLY Family Admin can approve tasks.
 * - Allowed for tasks with status Open (0) or Finished (1).
 * - Family Member: always false.
 */
export function canApprovePocketMoney(
  task: PMTask | any,
  currentMember: MemberResponse | any
): boolean {
  if (!task || !currentMember) return false;

  const memberType = Number(
    currentMember.MemberType ?? currentMember.memberType ?? MemberType.Member
  );
  if (memberType !== MemberType.FamilyAdmin) return false;

  const status = Number(task.Status ?? task.status ?? PMTransStatus.Open);
  return status === PMTransStatus.Open || status === PMTransStatus.Finished;
}
