// Wait for the DOM to be ready
document.addEventListener(
  'DOMContentLoaded',
  function () {
    // do something here ...
    // Get the select element
    const selectElement = document.getElementById('aos')

    // Add an event listener for the 'change' event
    selectElement.addEventListener('change', function (event) {
      // Get the selected value
      const selectedAos = event.target.value

      // Do something with the selected value
      console.log('Selected value:', selectedAos)

      // Add options to the department select element based on the selected aos value
      const departmentSelectElement = document.getElementById('dept')
      departmentSelectElement.innerHTML =
        '<option value="">-- Select a Department --</option>'

      const currentDepartments = departmentsByAos.find(
        (obj) => obj.aos === selectedAos
      ).departments
      console.log('currentDepartments :>> ', currentDepartments)

      currentDepartments.forEach((department, i) => {
        console.log('department :>> ', department.name)
        console.log('id :>> ', department.id)
        const option = document.createElement('option')
        option.value = department.id
        option.text = department.name
        departmentSelectElement.appendChild(option)
      })
    })
  },
  false
)
