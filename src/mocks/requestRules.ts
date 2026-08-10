import type { Request, Status, User } from "../features/requests/types";

export function canChangeStatus (
    currentUser: User,
    desklineRequest: Request,
    nextStatus: Status
) : boolean {
    const currentStatus = desklineRequest.status;

    if (currentUser.role === "requester") {
        return (
            desklineRequest.requesterId === currentUser.id &&
            currentStatus === "open" &&
            nextStatus === "cancelled"
        )
    }

    const isOpeningPendingTransition = 
        (currentStatus === "open" && nextStatus === "pending") ||
        (currentStatus === "pending" && nextStatus === "open");

    if (currentUser.role === "technician") {
        return isOpeningPendingTransition;
    }

    if (currentUser.role === "admin") {
        const isClosing =
            (currentStatus === "open" || currentStatus === "pending") && nextStatus === "closed";

        return isOpeningPendingTransition || isClosing;
    }

    return false;
}

export function canChangeAssignee (
    currentUser: User,
    nextAssigneeId: string | null,
    allUsers: User[]
) : boolean {

    if (currentUser.role === "requester") {
        return false;
    }

    if (currentUser.role === "technician") {
        return nextAssigneeId === currentUser.id;
    }

    if (currentUser.role === "admin") {
        if (nextAssigneeId === null) {
            return true;
        }

        const nextAssignee = allUsers.find((user) => user.id === nextAssigneeId);

        return (
            nextAssignee?.role === "technician" ||
            nextAssignee?.role === "admin"
        )
    }

    return false;
}