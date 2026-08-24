import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { NavLink } from "react-router-dom"
import type { BreadcrumbLinkComponent } from "../types/PropTypes"

function BreadcrumbLinkComponent({
  pages,
  currentPage,
}: BreadcrumbLinkComponent) {
  return (
    <Breadcrumb className="text-lg">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            render={
              <NavLink to="/" className="text-lg">
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
                  <NavLink to={page.link} className="text-lg">
                    {page.pageName}
                  </NavLink>
                }
              />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage className="text-lg">{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbLinkComponent
