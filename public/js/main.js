$(document).ready(function(){
  $('.delete-task').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const _this = this;
    if(confirm("Are you sure?"))
      $.ajax({
        type:'DELETE',
        url: '/tasks/'+id,
        success: function(response){
          $(_this).closest('.col-4').remove();
        },
        error: function(err){
          console.log(err);
        }
      });
  });

  $('.mark-as-complete').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const _this = this;
      $.ajax({
        type:'POST',
        url: '/tasks/complete/'+id,
        success: function(response){
          $(_this).removeClass('mark-as-complete bg-light text-dark');
          $(_this).addClass('rounded-pill bg-success');
          $(_this).text("Completed");
        },
        error: function(err){
          console.log(err);
        }
      });
  });

  $('.task-status').on('change', function(e){
    let filter_type = $(this).attr('data-filter');

    if ('URLSearchParams' in window) {
      var searchParams = new URLSearchParams(window.location.search)
      searchParams.set(filter_type, this.value);
      window.location.href = window.location.pathname + '?' + searchParams.toString();
  }
  });
});
