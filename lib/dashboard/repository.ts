import "server-only";
import {couchRequest} from "@/lib/couchdb/client";
import {mangoQuery} from "@/lib/couchdb/documents";
import type {OrderDocument,OrderStatus} from "@/lib/orders/service";

type ViewResponse<K,V>={rows:Array<{key:K;value:V}>};
const view=(name:string,query:string)=>couchRequest<ViewResponse<string,number>>(`/_design/reports/_view/${name}?${query}`);
export type DashboardFilters={from?:string;to?:string;status?:OrderStatus;page:number};

export async function dashboardData(filters:DashboardFilters){
 const revenueParams=new URLSearchParams({group:"true"});
 if(filters.from)revenueParams.set("startkey",JSON.stringify(filters.from));
 if(filters.to)revenueParams.set("endkey",JSON.stringify(`${filters.to}\ufff0`));
 const [statusResult,revenueResult,orderResult]=await Promise.all([
  view("orders_by_status","group=true"),view("revenue_by_day",revenueParams.toString()),mangoQuery<OrderDocument>({type:"order"},{limit:100})
 ]);
 const counts=Object.fromEntries(statusResult.rows.map(row=>[row.key,row.value])) as Partial<Record<OrderStatus,number>>;
 let orders=orderResult.docs.sort((a,b)=>b.created_at.localeCompare(a.created_at));
 if(filters.status)orders=orders.filter(order=>order.status===filters.status);
 if(filters.from)orders=orders.filter(order=>order.created_at.slice(0,10)>=filters.from!);
 if(filters.to)orders=orders.filter(order=>order.created_at.slice(0,10)<=filters.to!);
 const pageSize=8,totalFiltered=orders.length,pages=Math.max(1,Math.ceil(totalFiltered/pageSize));
 return {counts:{total:Object.values(counts).reduce((sum,value)=>sum+(value||0),0),processing:(counts.pending||0)+(counts.confirmed||0)+(counts.packing||0),shipping:counts.shipping||0,delivered:counts.delivered||0,...counts},revenue:revenueResult.rows.map(row=>({date:row.key,value:row.value})),orders:orders.slice((filters.page-1)*pageSize,filters.page*pageSize),totalFiltered,pages};
}
