"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { MemberResponse } from "@/app/types/familyMemberTypes";

export type ResourceType = {
  id: number;
  title: string;
  extendedProps?: {
    localId: number;
    memberId: string;
    image?: string;
    sortOrder?: number;
    color?: string;
  };
};

type ResourceContextType = {
  resources: ResourceType[];
  setMembers: (members: MemberResponse[]) => void;
};

const ResourceContext = createContext<ResourceContextType | null>(null);

export const ResourceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [members, setMembers] = useState<MemberResponse[]>([]);

  const resources = useMemo(() => {
    const sortedMembers = [...members].sort((a, b) => {
      if (a.MemberType === 1 && b.MemberType !== 1) return -1;
      if (b.MemberType === 1 && a.MemberType !== 1) return 1;

      if (a.MemberType === 0 && b.MemberType !== 0) return -1;
      if (b.MemberType === 0 && a.MemberType !== 0) return 1;

      if (a.MemberType > 1 && b.MemberType > 1) {
        const aDate = new Date(a.Birthdate || "");
        const bDate = new Date(b.Birthdate || "");
        return aDate.getTime() - bDate.getTime();
      }

      return 0;
    });

    return sortedMembers.map((member, index) => ({
      id: member.Id,
      title: member.FirstName,
      extendedProps: {
        localId: member.Id,
        memberId: member.MemberId,
        image: member.ResourceUrl,
        sortOrder: index,
        color: member.ColorCode ? member.ColorCode.slice(-6) : "000000",
      },
    }));
  }, [members]);

  return (
    <ResourceContext.Provider value={{ resources, setMembers }}>
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const ctx = useContext(ResourceContext);
  if (!ctx) {
    throw new Error("useResources must be used inside ResourceProvider");
  }
  return ctx;
};
