"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {Boxes,Database,FolderTree,LayoutDashboard,PackageSearch,Truck,UserCog,Users} from "lucide-react";
import {cn} from "@/lib/utils";
const items=[{href:"/admin",label:"Tổng quan",icon:LayoutDashboard,exact:true},{href:"/admin/products",label:"Sản phẩm",icon:Boxes},{href:"/admin/categories",label:"Danh mục",icon:FolderTree},{href:"/admin/orders",label:"Đơn hàng",icon:PackageSearch},{href:"/admin/deliveries",label:"Giao hàng",icon:Truck},{href:"/admin/customers",label:"Khách hàng",icon:Users},{href:"/admin/users",label:"Tài khoản",icon:UserCog},{href:"/admin/database",label:"Cơ sở dữ liệu",icon:Database}];
export function AdminNav(){const path=usePathname();return <nav aria-label="Điều hướng quản trị" className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">{items.map(({href,label,icon:Icon,exact})=>{const active=exact?path===href:path.startsWith(href);return <Link key={href} href={href} aria-current={active?"page":undefined} className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",active?"bg-subtle text-primary":"text-muted-foreground hover:bg-subtle hover:text-primary")}><Icon aria-hidden="true" className="size-4"/>{label}</Link>})}</nav>}
