import { AfterContentInit, Directive,ElementRef,Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocusDirective]'
})
export class AutoFocusDirectiveDirective implements AfterContentInit {

  @Input() public appAutoFocus : boolean | undefined;
  constructor(private el:ElementRef) { }

   public ngAfterContentInit(){
      setTimeout(() => {
          this.el.nativeElement.focus();
      }, 500);
   }
}
