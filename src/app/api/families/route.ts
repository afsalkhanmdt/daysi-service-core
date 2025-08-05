import { NextRequest, NextResponse } from "next/server";
import { normalizeKeys } from "../normalizeKeys";

import dbConnect from "@/core/db/connect";
import Family from "@/models/family";
import { FamilySchema } from "./dto";

export async function POST(request:NextRequest){
    try {
        const normalizedRequest = normalizeKeys(await request.json());
        const result = FamilySchema.safeParse(normalizedRequest);
        
    
        if (!result.success) {
          const { fieldErrors, formErrors } = result.error.flatten();
          return NextResponse.json({ fieldErrors, formErrors }, { status: 400 });
        }

        await dbConnect();

        const family = new Family({
        name: result.data.name,
        registeredDate: result.data.registereddate,
        subscriptionType: result.data.subscriptiontype,
        mailChimpSubscriptionType: result.data.mailchimpsubscriptiontype,
        holidaysCountryCode: result.data.holidayscountrycode,
        validTillDate: result.data.validtilldate,
        lastUsed: result.data.lastused,
        familyActive: result.data.familyactive,
        familyMemberQty: result.data.familymemberqty,
        defaultAlarm: result.data.defaultalarm,
        specialEventColorCode: result.data.specialeventcolorcode,
        currencyCode: result.data.currencycode,
        everyoneCreatePmTask: result.data.everyonecreatepmtask,
        region: result.data.region,
        });

        await family.save();

        return NextResponse.json({ message: 'Family created successfully'}, { status: 201 });

}
catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}