import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NavLink } from "react-router-dom"
import type { BreadcrumbLinkComponent as BreadcrumbLinkProps } from "../types/PropTypes"

function BreadcrumbLinkComponent({
  pages,
  currentPage,
}: BreadcrumbLinkProps) {
  return (
    <Breadcrumb className="">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <NavLink to="/" className="text-xs md:text-sm lg:text-base">
                Home
              </NavLink>
            }
          />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        {pages?.map((page) => (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <NavLink
                    to={page.link}
                    className="text-xs md:text-sm lg:text-base"
                  >
                    {page.pageName}
                  </NavLink>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs md:text-sm lg:text-base">
            {currentPage}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbLinkComponent
